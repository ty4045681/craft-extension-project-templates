import * as React from "react"
import * as ReactDOM from 'react-dom'
import craftXIconSrc from "./icon.png"

const App: React.FC<{}> = () => {
  const isDarkMode = useCraftDarkMode();

  React.useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  return <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }}>
    <img className="icon" src={craftXIconSrc} alt="CraftX logo" />
    <button className={`btn ${isDarkMode ? "dark" : ""}`} onClick={createContext}>
      Generate content
    </button>
  </div>;
}

function useCraftDarkMode() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    craft.env.setListener(env => setIsDarkMode(env.colorScheme === "dark"));
  }, []);

  return isDarkMode;
}

const createContext = async () => {
  const result = await craft.dataApi.getCurrentPage();
  if (result.status !== "success") {
    throw new Error(result.message);
  }
  
  const pageBlocks = result.data;

  const context = pageBlocks.subblocks.filter(pageBlock => {
    if ("style" in pageBlock) {
      let blockStyle = pageBlock.style.textStyle
      if (blockStyle === "title" || blockStyle === "subtitle" || blockStyle === "heading") {
        return true;
      }
      return false;
    }
  });

  // const insertBlock = []
  let index = 0
  let indent = 0
  // insert Content Block
  const block = craft.blockFactory.textBlock({
    content: [{
      text: "Content", highlightColor: "beachGradient"
    }],
    style: {
      textStyle: "title"
    },
    listStyle: {
      type: "toggle"
    },
  });

  craft.dataApi.addBlocks([block], {
    type: "indexLocation",
    pageId: pageBlocks.id,
    index: index,
  });
  index++;

  context.forEach((elem) => {
    if ("content" in elem) {
      switch (elem.style.textStyle) {
        case "title": {
          indent = 1
          break;
        }
        case "subtitle": {
          indent = 2
          break;
        }
        case "heading": {
          indent = 3
          break;
        }
        default: {
          indent = 0
        }
      };
      
      const block = craft.blockFactory.textBlock({
        content: elem.content,
        indentationLevel: indent,
      });

      craft.dataApi.addBlocks([block], {
        type: "indexLocation",
        pageId: pageBlocks.id,
        index: index,
      });
      index++;
    }
  })

  // const block = craft.blockFactory.textBlock({
  //   content: "Hello world!"
  // });

  // craft.dataApi.addBlocks([block]);
}

export function initApp() {
  ReactDOM.render(<App />, document.getElementById('react-root'))
}

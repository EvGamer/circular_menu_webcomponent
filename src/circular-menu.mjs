const toDeg = (radianAngle) => {
  return ((180 * radianAngle) / Math.PI).toFixed(2);
}

const createSectorSvg = (radius, radialHeight, angle) => {
  const bottomRadius = radius - radialHeight;

  const halfAngle = angle / 2;
  const halfAngleCos = Math.cos(halfAngle)
  const height = radius - bottomRadius * halfAngleCos;
  const heightStr = height.toFixed(2);

  const topY = radius - radius * halfAngleCos;
  const bottomY = height;

  const halfAngleSin = Math.sin(halfAngle);
  const bottomLeftX = radialHeight * halfAngleSin;
  const width = 2 * radius * halfAngleSin;
  const widthStr = width.toFixed(2);
  const bottomRightX = width - bottomLeftX;

  const svgStandardURI = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgStandardURI, "svg");
  svg.setAttribute("width", widthStr);
  svg.setAttribute("height", heightStr);
  svg.setAttribute("viewbox", `-1 -1 ${widthStr} ${heightStr}`)

  const angleDeg = toDeg(angle);
  const pathElement = document.createElementNS(svgStandardURI, "path");

  const topYStr = topY.toFixed(2);
  const bottomYStr = bottomY.toFixed(2);
  pathElement.setAttribute(
    "d", 
    `
      M 0 ${topYStr}
      A ${radius} ${radius} ${angleDeg} 0 1 ${widthStr} ${topYStr}
      L ${bottomRightX.toFixed(2)} ${bottomYStr}
      A ${bottomRadius} ${bottomRadius} ${angleDeg} 0 0 ${bottomLeftX.toFixed(2)} ${bottomYStr}
      L 0 ${topYStr}
    `
  )
  svg.appendChild(pathElement)
  
  return svg;
}

export class CircularMenu extends HTMLElement {
  constructor() {
    super();
  }

  isClickedInsideMenu = false;
  isMenuBeingOpened = false;
  menuContainer = null;
  button = null;

  _value = null;

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;

    this.button.textContent = this._value;
  }

  onClickOutsideMenu = () => {
    if (!this.menuContainer) return;

    if (!this.isClickedInsideMenu && !this.isMenuBeingOpened) {
      this.menuContainer.style.display = "none";
    }
    this.isMenuBeingOpened = false;
    this.isClickedInsideMenu = false;
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });


    const container = document.createElement("div");
    container.className = "container";

    const menuContainer = document.createElement("div");
    menuContainer.className = "menu-container";
    menuContainer.style.display = "none";
    this.menuContainer = menuContainer;

    menuContainer.addEventListener("click", () => {
      this.isClickedInsideMenu = true;
    })
    
    window.addEventListener("click", this.onClickOutsideMenu);

    const button = document.createElement("button");
    button.classList.add("button");
    this.button = button;

    button.addEventListener("click", () => {
      const isMenuOpen = menuContainer.style.display !== "none";
      
      if (!isMenuOpen) {
        menuContainer.style.display = "block";
        this.isMenuBeingOpened = true;
        window.addEventListener("click", this.onClickOutsideMenu);
      } else {
        menuContainer.style.display = "none";
        window.removeEventListener("click", this.onClickOutsideMenu);
      }
    })

    const buttonDiameter = 50;
    const menuDiameter = 200;
    const buttonRadius = buttonDiameter / 2;
    const menuRadius = menuDiameter / 2;

    const optionElements = this.querySelectorAll("option");

    const sectorAngleDeg = 360 / optionElements.length;
    const sectorAngleRad = 2 * Math.PI / optionElements.length;
    const gap = 2;

    let i = 0;
    for (const optionElement of optionElements) {
      const menuItemAnchor = document.createElement("div");
      menuItemAnchor.className = "menu-item-anchor";
      menuItemAnchor.style.transform = `rotate(${sectorAngleDeg * i}deg)`;

      const menuItemBackground = createSectorSvg(menuRadius - gap, menuRadius - (buttonRadius + gap), sectorAngleRad);
      menuItemBackground.classList.add("menu-item-background");

      const menuItemContainer = document.createElement("div");
      menuItemContainer.className = "menu-item-container";
      menuItemContainer.style.width = `${menuItemBackground.width}px`;
      menuItemContainer.style.height = `${menuItemBackground.height}px`;

      menuItemContainer.addEventListener("click", () => {
        this.value = optionElement.value;
        menuContainer.style.display = "none";
      });

      const menuItemContent = document.createElement("div")
      menuItemContent.className = "menu-item-content";
      menuItemContent.append(...optionElement.childNodes);
      
      menuItemContainer.appendChild(menuItemBackground);
      menuItemContainer.appendChild(menuItemContent);
      menuItemAnchor.appendChild(menuItemContainer);
      menuContainer.appendChild(menuItemAnchor);
      i++;
    }

    const style = document.createElement("style");

    style.textContent = `
      .container {
        position: relative;
        --bg-color: #424242;
        --bg-hover-color: #696969;
        --stroke-width: 0px;
        --stroke-color: #A0A0A0;
      }

      button {
        position: relative;
        width: ${buttonDiameter}px;
        height: ${buttonDiameter}px;
        border-radius: 50%;
        box-sizing: border-box;
        background-color: var(--bg-color);
        border: var(--stroke-width) solid  var(--stroke-color);
        cursor: pointer;
        outline: none;
        z-index: 1;
      }
      
      button:hover {
        background-color: var(--bg-hover-color);
      }
      
      .menu-container {
        position: absolute;
        color: var(--stroke-color)
        position: absolute;
        z-index: 0;
        width: ${menuDiameter + gap}px;
        height: ${menuDiameter + gap}px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .menu-item-container {
        position: relative;
        overflow: visible;
        pointer-events: none;
      }
      
      .menu-item-content {
        width: 50px;
        font-size: 24px;
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
      }

      .menu-item-anchor {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        position: absolute;
        width: ${menuDiameter + gap}px;
        height: ${menuDiameter + gap}px;
        pointer-events: none;
      }

      .menu-item-background {
        fill: var(--bg-color);
        stroke: var(--stroke-color);
        stroke-width: var(--stroke-width);
        position: relative;
        pointer-events: fill;
      }
      
      .menu-item-background:hover {
        fill: var(--bg-hover-color);
      }
    `

    container.appendChild(button);
    container.appendChild(menuContainer);

    shadow.appendChild(style);
    shadow.appendChild(container);
  }

  disconnectCallback() {
    window.removeEventListener("click", this.onClickOutsideMenu);
  }
}
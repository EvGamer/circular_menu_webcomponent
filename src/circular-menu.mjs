export class CircularMenu extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const optionElements = this.querySelectorAll("option");

    const shadow = this.attachShadow({ mode: "open" });

    const button = document.createElement("button");
    button.classList.add("button");

    const container = document.createElement("div");
    container.classList.add("container");

    const style = document.createElement("style");

    style.textContent = `
      button {
        width: 50px;
        height: 50px;
        border-radius: 100%;
        background-color: red;
        border: none;
        outline: none;
      }
      
      .container {
        position: relative;
      }
    `

    container.appendChild(button);

    shadow.appendChild(style);
    shadow.appendChild(container);
  }
}
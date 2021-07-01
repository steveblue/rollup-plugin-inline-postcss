const foo = () => {};

class MyButtonComponent extends HTMLButtonElement {
  constructor() {
    super();
    this.style = foo`
      :host {
        background: #abcefe;
        cursor: pointer;
        color: white;
        font-weight: 400;
      }
    `;
  }

  onClick(event) {}
}

customElements.define('my-button', MyButtonComponent, { extends: 'button' });

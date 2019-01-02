class MyButtonComponent extends ButtonComponent {
	constructor() {
		super();
		this.style = css`
			:host {
				background: rgba(24, 24, 24, 1);
				cursor: pointer;
				color: white;
				font-weight: 400;
			}
		`;
	}

	onClick(event) {

	}
}

customElements.define('my-button', MyButtonComponent, { extends: 'button'});

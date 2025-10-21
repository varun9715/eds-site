// Vitest polyfill for PointerEvent
if (typeof global.PointerEvent === 'undefined') {
  global.PointerEvent = class extends MouseEvent {
    pointerType;

    constructor(type, props) {
      super(type, props);
      this.pointerType = props.pointerType || 'mouse';
    }
  };
}

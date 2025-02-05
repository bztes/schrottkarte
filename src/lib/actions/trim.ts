export function trim(node: HTMLInputElement) {
  function handleBlur() {
    node.value = node.value.trim();
  }

  node.addEventListener('blur', handleBlur);

  return {
    destroy() {
      node.removeEventListener('blur', handleBlur);
    },
  };
}

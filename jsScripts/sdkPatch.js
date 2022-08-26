const message =
  'You cannot make writing operations right here but you can download Point Browser and have the full web3 experience. https://pointnetwork.io/download';

if (window.point) {
  window.point.contract.send = () => alert(message);
}
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('test-btn');
  
  if (btn) {
    btn.addEventListener('click', () => {
      console.log('SEAS Popup: Test button clicked');
      // In the future, we can send messages to content scripts here
    });
  }
});

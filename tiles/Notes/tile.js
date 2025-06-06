console.log("Tile Notes loaded");

document.addEventListener('DOMContentLoaded', () => {
  const notesArea = document.getElementById('notesArea');
  const clearBtn = document.getElementById('clearNotesBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');

  // Load saved notes
  notesArea.value = localStorage.getItem('dashboardNotes') || '';

  // Save on input
  notesArea.addEventListener('input', () => {
    localStorage.setItem('dashboardNotes', notesArea.value);
  });

  // Show modal on clear button click
  clearBtn.addEventListener('click', () => {
    modalBackdrop.classList.remove('hidden');
  });

  // Cancel clearing
  modalCancelBtn.addEventListener('click', () => {
    modalBackdrop.classList.add('hidden');
  });

  // Confirm clearing
  modalConfirmBtn.addEventListener('click', () => {
    notesArea.value = '';
    localStorage.removeItem('dashboardNotes');
    modalBackdrop.classList.add('hidden');
  });

  // Optional: close modal if clicking outside modal box
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      modalBackdrop.classList.add('hidden');
    }
  });
});

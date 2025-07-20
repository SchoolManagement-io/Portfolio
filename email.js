const EMAILJS_PUBLIC_KEY = 'QuFlo-BpPJH92zktr';
const EMAILJS_SERVICE_ID = 'service_tpzpife';
const EMAILJS_TEMPLATE_ID = 'template_bi9usg8';

// Simple input sanitization function
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML.replace(/[<>]/g, '');
}

// Rate limiting
let lastSubmissionTime = 0;
const SUBMISSION_COOLDOWN = 30000; // 30 seconds in milliseconds

document.addEventListener('DOMContentLoaded', () => {
  const messageForm = document.getElementById('messageForm');
  const inputs = messageForm.querySelectorAll('input, textarea');
  const feedback = document.getElementById('formFeedback');

  // Real-time input validation
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (input.validity.valid) {
        input.classList.remove('error');
      } else {
        input.classList.add('error');
      }
    });
  });

  // Initialize EmailJS
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  // Form submission handler
  messageForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Rate limiting check
    const currentTime = Date.now();
    if (currentTime - lastSubmissionTime < SUBMISSION_COOLDOWN) {
      feedback.style.display = 'block';
      feedback.style.color = '#ff5555';
      feedback.textContent = 'Please wait before submitting again.';
      setTimeout(() => feedback.style.display = 'none', 5000);
      return;
    }

    // Get and sanitize form inputs
    const name = sanitizeInput(document.getElementById('fullName').value.trim());
    const email = sanitizeInput(document.getElementById('emailAddress').value.trim());
    const message = sanitizeInput(document.getElementById('userMessage').value.trim());

    // Validate inputs
    if (!name || !email || !message) {
      feedback.style.display = 'block';
      feedback.style.color = '#ff5555';
      feedback.textContent = 'Please fill in all fields correctly.';
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      feedback.style.display = 'block';
      feedback.style.color = '#ff5555';
      feedback.textContent = 'Please enter a valid email address.';
      document.getElementById('emailAddress').classList.add('error');
      return;
    }

    // Send email via EmailJS
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name: name,
      from_email: email,
      message: message
    }).then(() => {
      lastSubmissionTime = Date.now();
      feedback.style.display = 'block';
      feedback.style.color = '#00ffcc';
      feedback.textContent = 'Message sent successfully. I will connect with you soon.';
      messageForm.reset();
      inputs.forEach(input => input.classList.remove('error'));
      setTimeout(() => feedback.style.display = 'none', 5000);
    }).catch(err => {
      feedback.style.display = 'block';
      feedback.style.color = '#ff5555';
      feedback.textContent = 'Error sending message. Please try again.';
      console.error('EmailJS error:', err);
    });
  });
});
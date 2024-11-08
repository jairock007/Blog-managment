document.addEventListener("DOMContentLoaded", () => {
  // Fetch and display courses
  fetchCourses();
  fetchBlogPosts();
  setupPaymentModal();
});

async function fetchCourses() {
  try {
    const response = await fetch("http://localhost:3000/api/courses");
    const courses = await response.json();
    displayCourses(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
  }
}

async function fetchBlogPosts() {
  try {
    const response = await fetch("http://localhost:3000/api/blog-posts");
    const posts = await response.json();
    displayBlogPosts(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
  }
}

function displayCourses(courses) {
  const container = document.getElementById("courses-container");
  courses.forEach((course) => {
    const courseElement = document.createElement("div");
    courseElement.className = "course-card";
    courseElement.innerHTML = `
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <div class="price">
                <span class="original-price">₹${course.price}</span>
                <span class="discount-price">₹${course.discount_price}</span>
            </div>
            <button onclick="initiatePurchase(${course.id})">Enroll Now</button>
        `;
    container.appendChild(courseElement);
  });
}

function displayBlogPosts(posts) {
  const container = document.getElementById("blog-container");
  posts.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className = "blog-card";
    postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content.substring(0, 150)}...</p>
            <div class="blog-meta">
                <span>By ${post.author_name}</span>
                <span>${new Date(post.created_at).toLocaleDateString()}</span>
            </div>
        `;
    container.appendChild(postElement);
  });
}

function setupPaymentModal() {
  const modal = document.getElementById("payment-modal");
  const closeBtn = modal.querySelector(".close");
  const paymentForm = document.getElementById("payment-form");

  closeBtn.onclick = () => {
    modal.style.display = "none";
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  paymentForm.onsubmit = (e) => {
    e.preventDefault();
    processPayment();
  };
}

function initiatePurchase(courseId) {
  const modal = document.getElementById("payment-modal");
  modal.style.display = "block";
  modal.dataset.courseId = courseId;
}

async function processPayment() {
  const modal = document.getElementById("payment-modal");
  const courseId = modal.dataset.courseId;
  const paymentMethod = document.querySelector(
    'input[name="payment-method"]:checked'
  ).value;

  try {
    const response = await fetch("http://localhost:3000/api/process-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        courseId,
        paymentMethod,
        // Add other necessary payment details
      }),
    });

    const result = await response.json();
    if (result.status === "pending") {
      // Redirect to verification page or show success message
      alert("Payment initiated successfully!");
      modal.style.display = "none";
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    alert("Payment failed. Please try again.");
  }
}

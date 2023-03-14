const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = form.username.value;
  const password = form.password.value;

  // check if username and password are correct
  if (username === "sylvi" && password === "amanda") {
    alert("Berhasil!");
    // redirect to dashboard page
    window.location.href = "../pesan.html";
  } else {
    alert("Invalid username or password.");
  }
});

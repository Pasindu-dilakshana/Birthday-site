 // Show custom alert after 15 seconds
  setTimeout(() => {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("customAlert").style.display = "block";
  }, 15000);

  function goToPage() {
    window.location.href = "index1.html"; // Replace with your page
  }
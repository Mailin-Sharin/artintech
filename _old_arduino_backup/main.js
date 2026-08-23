// Contact form - saves inquiry locally (no backend needed for static host)
document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {
        name: form.name.value,
        email: form.email.value,
        message: form.message.value,
        at: new Date().toISOString()
      };
      try {
        var inbox = JSON.parse(localStorage.getItem("artintech_inbox") || "[]");
        inbox.push(data);
        localStorage.setItem("artintech_inbox", JSON.stringify(inbox));
        status.textContent = "پیام شما ثبت شد. همان روز پاسخ می‌دهیم.";
        form.reset();
      } catch (err) {
        status.textContent = "خطا در ارسال. لطفاً از تلگرام یا واتس‌اپ استفاده کنید.";
      }
    });
  }

  // Load latest blog posts into homepage
  var list = document.getElementById("blog-list");
  if (list) {
    fetch("posts/index.json")
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (posts) {
        if (!posts.length) {
          list.innerHTML = '<p class="meta">به‌زودی مطالب منتشر می‌شوند.</p>';
          return;
        }
        posts.slice(0, 3).forEach(function (p) {
          var a = document.createElement("a");
          a.href = "posts/" + p.file;
          a.className = "blog-item";
          a.innerHTML = "<h4>" + p.title + "</h4><div class='meta'>" + p.date + " — " + p.read + "</div>";
          list.appendChild(a);
        });
      })
      .catch(function () {
        list.innerHTML = '<p class="meta">به‌زودی مطالب منتشر می‌شوند.</p>';
      });
  }
});

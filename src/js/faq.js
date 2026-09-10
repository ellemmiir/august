// document.addEventListener("DOMContentLoaded", function () {
//   const faqItems = document.querySelectorAll(".faq-item");

//   faqItems.forEach((item) => {
//     const question = item.querySelector(".faq-question");
//     const answer = item.querySelector(".faq-answer");

//     question.addEventListener("click", function () {
//       const isActive = item.classList.contains("active");

//       faqItems.forEach((otherItem) => {
//         if (otherItem !== item && otherItem.classList.contains("active")) {
//           otherItem.classList.remove("active");
//           const otherAnswer = otherItem.querySelector(".faq-answer");
//           otherAnswer.style.maxHeight = "0px";
//         }
//       });

//       item.classList.toggle("active");

//       if (isActive) {
//         answer.style.maxHeight = "0px";
//       } else {
//         requestAnimationFrame(() => {
//           answer.style.maxHeight = answer.scrollHeight + "px";
//         });
//       }
//     });
//   });
// });

console.log("hello");

function sendEmail() {
    let send = document.querySelector("#sendEmail");
    send.addEventListener("click", function(e) {
        e.preventDefault();
        let subject = document.querySelector("#subject");
        let message = document.querySelector("#message");
        console.log(subject.value, message.value)
        // if (subject.value || message.value === "") {
        //     let error = document.querySelector("#empty");
        //     error.innerHTML = "Cannot leave field blank"
        // }
        window.open(`mailto:slipyourhandinmybackpocket@gmail.com?subject=${subject.value}&body=${message.value}`);
    })
}

sendEmail();
// window.open('mailto:test@example.com?subject=subject&body=body');

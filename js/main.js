function _(el) {
    return document.getElementById(el);
}
//register user
$("#registerForm").submit(function(event) {
    event.preventDefault();
    var obj = {};
    obj.name = _('name').value;
    obj.email = _('email').value;
    obj.select = _('stateChapter').value;
    obj.password = _('password').value;

    $.ajax({
        url: 'https://nes-elearn.herokuapp.com/register',
        method: 'POST',
        data: obj,
        dataType: "JSON",
    }).done(function(data) {
        console.log(data);
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userEmail', data.email);
        window.location.replace("/courses")
    }).fail(function(err) {
        console.log(err);
    })


});

//login user 
$("#loginForm").submit(function(event) {
    event.preventDefault();
    var obj = {};

    obj.email = _('email').value;
    obj.password = _('password').value;

    $.ajax({
        url: 'https://nes-elearn.herokuapp.com/login',
        method: 'POST',
        data: obj,
        dataType: "JSON",
    }).done(function(data) {
        console.log(data);
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userEmail', data.email);
        window.location.replace("/courses")
    }).fail(function(err) {
        console.log(err);
        _('error').innerHTML = "Email or Password Incorrect!!";
    })
});

// //logout user 
// $('#logout').click(function(event) {
//     event.preventDefault();
//     $.ajax({
//         url: '/logout',
//         method: 'GET',
//     }).done(function(data) {
//         console.log(data);
//         window.location.replace("/login")
//     }).fail(function(err) {
//         alert("Something went wrong!")
//     })
// })

//Get All 36 State Names
$.ajax({
    url: 'https://locationsng-api.herokuapp.com/api/v1/states',
    method: 'GET',
}).done(function(data) {
    console.log(data);
    for (var i in data) {
        let content = `<option>${data[i].name}</option>`
        $('#stateChapter').append(content);
    }
    //document.getElementById('stateNames').innerHTML = "";
}).fail(function(err) {
    alert("Something went wrong!")
})

//Get All Courses
$(document).ready(function() {

});
// $(document).ready(function() {
$.ajax({
    url: 'https://nes-elearn.herokuapp.com/courses',
    method: 'GET',
}).done(function(data) {
    console.log(data);
    document.getElementById('getCourses').innerHTML = "";
    for (var i in data) {
        content = ` <div class="col-lg-4 course_col">
        <div class="course">
            <div class="course_image"><img src="images/${data[i].poster}" alt=""></div>
            <div class="course_body">
                <div class="course_title"><a href="/course#${data[i].id}">${data[i].title}</a></a></div>
                <div class="course_info">
                    <ul>
                        <li><a href="instructors.html">${data[i].author.name}</a></li>
                        <!-- <li><a href="#">English</a></li> -->
                    </ul>
                </div>
                <div class="course_text">
                    <p class="block-with-text">${data[i].description}</p>
                </div>
            </div>
            <div class="course_footer d-flex align-items-center" style="justify-content: space-between;">
                <div class="course_mark ${(data[i].price == 0) ?  'course_free' : ''}  "><a href="#">${(data[i].price == 0) ? "Free" : "₦" + data[i].price}</a></div>
                <div class="course_students"><i class="fa fa-user" aria-hidden="true"></i><span>${data[i].studentCount}</span></div>
            </div>
        </div>
    </div>`

        $('#getCourses').append(content);
    }

}).fail(function(err) {
    alert("Something went wrong!");
    console.log(err)
});

let courseId = window.location.hash.substr(1, 1);
console.log(courseId);
if (!courseId) {
    courseId = 1
}

let url = 'https://nes-elearn.herokuapp.com/courses/' + courseId;
$.ajax({
    url: url,
    method: 'GET',
}).done(function(data) {
    console.log(data);
    let content = ` <div class="intro_background parallax-window" id="intro_background" data-parallax="scroll" data-speed="0.8"></div>
    <div class="container">
        <div class="row">
            <div class="col">
                <div class="intro_container d-flex flex-column align-items-start justify-content-end">
                    <div class="intro_content">
                        <div class="intro_price" data-price="${data.price}">${(data.price == 0) ? "Free" : "₦" + data.price}</div>
                        <div style="display: none;" class="rating_r rating_r_4 intro_rating"><i></i><i></i><i></i><i></i><i></i></div>
                        <div class="intro_title">Envionmental Competency Development (Level 2)</div>
                        <div class="intro_meta">
                            <div class="intro_image"><img src="images/member_0.jpg" alt=""></div>
                            <div class="intro_instructors" id="introInstructors"><a href="instructors.html">${data.author.name}</a></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`
    $('#bgImg').append(content);
    $('#aboutCourse1').html(data.description);
    document.getElementById("intro_background").style.background = `url('images/${data.poster}')`;
}).fail(function(err) {
    alert("Something went wrong!");
    console.log(err)
})

function payWithPaystack() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        alert('You have to login to purchase this course');
        window.location.replace('login');
        return;
    }

    const amount = $('#aboutCourse1 intro_price').attr('data-price');

    var handler = PaystackPop.setup({
        key: 'pk_test_ed448c14e129fb9bd43d32a4780a2749c631b9af',
        email: localStorage.getItem('userEmail'),
        amount: amount * 100,
        callback: function(response) {
            const paymentReference = response.reference;
            submitBuyCourseRequest(token, paymentReference);
        }
    });
    handler.openIframe();
}

function submitBuyCourseRequest(token, paymentReference) {
    $.ajax({
        url: 'https://nes-elearn.herokuapp.com/buy-course',
        method: 'POST',
        data: { courseId, token, paymentReference }, // courseId is declared and assigned above
        dataType: "JSON",
    }).done(function(data) {
        console.log(data);
        // data should contain FULL course object with multiple choice questions and links to the PDF materials
        // user should now be allowed to access materials and take tests
    }).fail(function(err) {
        console.log(err);
        _('error').innerHTML = "Course purchase failed!!";
    })
}
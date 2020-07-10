const SERVER_PATH = `http://localhost:3000`

function fetchData() {
    $(`#table-list-todo`).empty()

    $.ajax({
        method: `GET`,
        url: `${SERVER_PATH}/todos`,
        headers: {
            token: localStorage.getItem('token')
        }
    })
        .done((response) => {
            console.log(`done`);
            console.log(response);
            response.forEach(todo => {
                $(`#table-list-todo`).append(
                    `<tr>
                    <td class="id">${todo.id}</td>
                    <td class="title">${todo.title}</td>
                    <td class="description">${todo.description}</td>
                    <td class="status">${todo.status}</td>
                    <td class="due_date">${new Date(todo.due_date).toDateString()}</td>
                    <td> <button value="${todo.id}" type="button" class="btn btn-primary btn-update">Update</button> <button value="${todo.id}" type="button" class="btn btn-danger btn-delete">Delete</button> </td>
                </tr>`
                )
            })
        })
        .fail((xhr, status, error) => {
            console.log(`fail`)
            console.log(xhr.responseJSON, status, error)
        })
        .always((response) => {
            console.log(`response`)
            console.log(response)
        })
}

function afterLoginSubmit() {
    $('#login-nav').hide()
    $('#login-page').hide()

    $('#register-nav').hide()
    $('#register-page').hide()

    $('#todo-create-nav').show()
    $('#create-todo-page').hide()

    $('#todo-list-nav').show()
    $('#list-todo-page').show()

    $('#logout-nav').show()

    fetchData()
}

function afterLogoutSubmit() {
    $('#login-nav').show()
    $('#login-page').show()
    $(`#email-login`).val('')
    $(`#password-login`).val('')

    $('#register-nav').show()
    $('#register-page').hide()

    $('#todo-list-nav').hide()
    $('#todo-create-nav').hide()


    $('#create-todo-page').hide()
    $('#list-todo-page').hide()

    $(`#update-todo-page`).hide()

    $('#logout-nav').hide()
}

//Google Oauth
function onSignIn(googleUser) {
    const google_token = googleUser.getAuthResponse().id_token;

    // console.log(google_token);

    $.ajax({
        method: `POST`,
        url: `${SERVER_PATH}/login/google`,
        headers: {
            google_token
        }
    })
        .done(response => {
            console.log(`done`, response)
            const token = response.token;
            localStorage.setItem('token', token)
            afterLoginSubmit()
        })
        .fail(response => {
            console.log(`fail`, response.responseJSON)
            $(`#login-error`).remove()
            $(`#form-login`).before(`<p id="login-error" style="color: red;">${response.responseJSON.errors}</p>`)
        })
        .always(response => {
            console.log(`always`, response)
        })
}

function googleSignOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        afterLogoutSubmit()
    });
}

$(document).ready(function () {
    if (!localStorage.getItem('token')) {
        afterLogoutSubmit()
    } else {
        afterLoginSubmit()
    }
})

//NAV button before login
$('#register-nav').click(function (event) {
    $(`#register-error`).remove()

    $('#login-page').hide()
    $('#register-page').show()

    event.preventDefault()
})

$('#login-nav').click(function (event) {
    $(`#login-error`).remove() //jika sebelumnya salah login

    $('#login-page').show()
    $('#register-page').hide()

    event.preventDefault()
})

//PAGE FORM before login
$('#register-page').submit(function (event) {
    let registerEmail = $(`#email-register`).val();
    let registerPassword = $(`#password-register`).val();

    // console.log(registerEmail, registerPassword);

    $.ajax({
        method: `POST`,
        url: ` http://localhost:3000/register`,
        data: {
            email: registerEmail,
            password: registerPassword
        }
    })
        .done((response) => {
            console.log(`done`)
            console.log(response)

            $('#login-page').show()
            $('#register-page').hide()

            $(`#email-register`).val('')
            $(`#password-register`).val('')
        })
        .fail((xhr, status, error) => {
            console.log(`fail`)
            console.log(xhr.responseJSON, status, error)

            let errorMsg;
            if (Array.isArray(xhr.responseJSON.errors.message)) {
                errorMsg = xhr.responseJSON.errors.message.join(', ')
            } else {
                errorMsg = xhr.responseJSON.errors.message
            }
            $(`#register-error`).remove()
            $(`#form-register`).before(`<p id="register-error" style="color: red;">${errorMsg}</p>`)
        })
        .always((response) => {
            console.log(`response`)
            console.log(response)
        })

    $(`#email-register`).val('');
    $(`#password-register`).val('');

    event.preventDefault()
})

$(`#login-page`).submit(function (event) {

    let loginEmail = $(`#email-login`).val();
    let loginPassword = $(`#password-login`).val();

    // console.log(loginEmail, loginPassword)

    $.ajax({
        method: `POST`,
        url: `${SERVER_PATH}/login`,
        data: {
            email: loginEmail,
            password: loginPassword
        }
    })
        .done((response) => {
            console.log(`done`);
            // console.log(response);

            localStorage.setItem('token', response.accessToken);

            afterLoginSubmit()
        })
        .fail((xhr, status, error) => {
            console.log(`fail`)
            console.log(xhr.responseJSON, status, error)

            $(`#login-error`).remove()
            $(`#form-login`).before(`<p id="login-error" style="color: red;">${xhr.responseJSON.errors.message}</p>`)
        })
        .always((response) => {
            console.log(`response`)
            // console.log(response)
        })


    event.preventDefault()
})




//NAV button after login
$('#logout-nav').click(function (event) {
    localStorage.removeItem('token');

    googleSignOut();

    event.preventDefault()
})

$('#todo-list-nav').click(function (event) {

    // console.log(`todo list nav`)

    $('#create-todo-page').hide()
    $(`#list-todo-page`).show()
    $(`#update-todo-page`).hide()

    fetchData()

    event.preventDefault()
})

$(`#todo-create-nav`).click(function (event) {
    $(`#create-error`).remove()

    // console.log(`todo create nav`)

    $('#create-todo-page').show()
    $(`#list-todo-page`).hide()
    $(`#update-todo-page`).hide()

    event.preventDefault()
})

$(`#create-todo-page`).submit(function (event) {
    const title = $(`#title-create`).val()
    const description = $(`#description-create`).val()
    const due_date = $(`#due_date-create`).val()
    const status = `undone`

    // console.log(title, description, due_date, status, localStorage.getItem('token'));

    $.ajax({
        method: `POST`,
        url: `${SERVER_PATH}/todos`,
        headers: {
            token: localStorage.getItem('token')
        },
        data: {
            title,
            description,
            due_date,
            status
        }
    })
        .done(response => {
            console.log(`done`);
            console.log(response);

            fetchData()
            $(`#list-todo-page`).show()
            $(`#create-todo-page`).hide()
        })
        .fail((xhr, status, error) => {
            console.log(`fail`);
            console.log(xhr.responseJSON);

            let errorMsg;
            if (Array.isArray(xhr.responseJSON.errors.message)) {
                errorMsg = xhr.responseJSON.errors.message.join(', ')
            } else {
                errorMsg = xhr.responseJSON.errors.message
            }
            $(`#create-error`).remove()
            $(`#form-create`).before(`<p id="create-error" style="color: red;">${errorMsg}</p>`)
        })
        .always(response => {
            console.log(`response`);
            console.log(response);
        })

    event.preventDefault()
})


//Action button after login
$(`#table-list-todo`).on('click', '.btn-delete', function (event) {

    // console.log(event.target.value)

    const todoId = event.target.value;
    $.ajax({
        method: `DELETE`,
        url: `${SERVER_PATH}/todos/${todoId}`,
        headers: {
            token: localStorage.getItem('token')
        }
    })
        .done(response => {
            console.log(`done`);
            console.log(response);

            fetchData()
            $(`#list-todo-page`).show()
            $(`#create-todo-page`).hide()
        })
        .fail((xhr, status, error) => {
            console.log(`fail`);
            console.log(xhr.responseJSON);

            let errorMsg;
            if (Array.isArray(xhr.responseJSON.errors.message)) {
                errorMsg = xhr.responseJSON.errors.message.join(', ')
            } else {
                errorMsg = xhr.responseJSON.errors.message
            }
            $(`#create-error`).remove()
            $(`#form-create`).before(`<p id="create-error" style="color: red;">${errorMsg}</p>`)
        })
        .always(response => {
            console.log(`response`);
            console.log(response);
        })


})

$(`#table-list-todo`).on('click', '.btn-update', function (event) {
    event.preventDefault()

    // console.log(event.target.value)

    const todoId = event.target.value;

    $.ajax({
        method: `GET`,
        url: `${SERVER_PATH}/todos`,
        headers: {
            token: localStorage.getItem('token')
        }
    })
        .done((response) => {
            console.log(`done`);
            console.log(response);

            // console.log(response.find(({ id }) => id == todoId))

            const todoUpdate = response.find(({ id }) => id == todoId);
            const dateFormat = new Date(todoUpdate.due_date).toISOString().split('T')[0]

            $(`#form-update`).empty()
            $(`#form-update`).append(
                `
            <div class="form-group">
                <label for="Id">Id</label>
                <input type="text" class="form-control" id="id-update" value="${todoUpdate.id}" disabled>
            </div>
            <div class="form-group">
                <label for="title">Title</label>
                <input type="text" class="form-control" id="title-update" value="${todoUpdate.title}" required>
            </div>
            <div class="form-group">
                <label for="description">Description</label>
                <input type="text" class="form-control" id="description-update" value="${todoUpdate.description}" required>
            </div>
            <div class="form-group">
                <label for="due_date">Due Date</label>
                <input type="date" class="form-control" id="due_date-update" value="${dateFormat}" required>
            </div>

            <input type="radio" name="status" value="done" ${todoUpdate.status == 'done' ? 'checked' : ''} required/> done <br />
            <input type="radio" name="status" value="undone" ${todoUpdate.status == 'undone' ? 'checked' : ''} required/> undone <br />
            
            <button type="submit" class="btn btn-primary">Update Todo</button>`
            )
        })
        .fail((xhr, status, error) => {
            console.log(`fail`)
            console.log(xhr.responseJSON, status, error)
        })
        .always((response) => {
            console.log(`response`)
            console.log(response)
        })

    $(`#list-todo-page`).hide()
    $(`#update-todo-page`).show()

})

$(`#update-todo-page`).submit(function (event) {
    event.preventDefault()


    const id = $(`#id-update`).val()
    const title = $(`#title-update`).val()
    const description = $(`#description-update`).val()
    const due_date = $(`#due_date-update`).val()
    const status = $(`input[name=status]:checked`, `#form-update`).val()
    // const status = `undone`

    // console.log(id, title, description, due_date, status);

    $.ajax({
        method: `PUT`,
        url: `${SERVER_PATH}/todos/${id}`,
        headers: {
            token: localStorage.getItem('token')
        },
        data: {
            title,
            description,
            due_date,
            status
        }
    })
        .done(response => {
            console.log(`done`);
            console.log(response);

            fetchData()
            $(`#list-todo-page`).show()
            $(`#update-todo-page`).hide()
        })
        .fail((xhr, status, error) => {
            console.log(`fail`);
            console.log(xhr.responseJSON);
        })
        .always(response => {
            console.log(`response`);
            console.log(response);
        })
})





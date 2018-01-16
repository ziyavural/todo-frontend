import React from 'react';
import {render} from 'react-dom';
import axios from 'axios';

const Login = ({login}) => {

    let email, password;

    return (
        <div className="row">
            <div className="col-md-12">
                <div className="form-login">
                    <h4>Login</h4>
                    <input type="text" id="userName" className="form-control input-sm" placeholder="username"
                           ref={node => {
                               email = node;
                           }}/>
                    <br/>
                    <input type="text" id="userPassword" className="form-control input-sm" placeholder="password"
                           ref={node => {
                               password = node;
                           }}/>
                    <br/>
                    <div className="wrapper">
                        <span className="group-btn">
                            <a href="#" className="btn btn-primary btn-md"
                               onClick={() => login({email: email.value, password: password.value})}>Login <i
                                className="fa fa-sign-in"></i></a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
};

const Register = ({register, skipRegister}) => {

    let firstName, lastName, email, password;

    return (
        <div className="row">
            <div className="col-md-12">
                <div className="form-login">
                    <h4>Register</h4>
                    <input type="text" id="firstName" className="form-control input-sm" placeholder="firstName"
                           ref={node => {
                               firstName = node;
                           }}/>
                    <br/>
                    <input type="text" id="lastName" className="form-control input-sm" placeholder="lastName"
                           ref={node => {
                               lastName = node;
                           }}/>
                    <br/>
                    <input type="text" id="email" className="form-control input-sm" placeholder="email" ref={node => {
                        email = node;
                    }}/>
                    <br/>
                    <input type="text" id="password" className="form-control input-sm" placeholder="password"
                           ref={node => {
                               password = node;
                           }}/>
                    <br/>
                    <div className="wrapper">
                        <span className="group-btn">
                            <a href="#" className="btn btn-primary btn-md" onClick={() => register({
                                firstName: firstName.value,
                                lastName: lastName.value,
                                email: email.value,
                                password: password.value
                            })}>Register <i className="fa fa-user-plus"></i></a>
                            <a href="#" className="col-md-offset-1" onClick={() => skipRegister()}>
                                Already have an account?
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
};

const Title = ({todoCount}) => {
    return (
        <div>
            <div>
                <h3>to-do ({todoCount})</h3>
            </div>
        </div>
    );
};

const TodoForm = ({addTodo}) => {

    let input;

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            addTodo(input.value);
            input.value = '';
        }}>
            <input className="form-control col-md-12" ref={node => {
                input = node;
            }}/>
            <br/>
        </form>
    );
};

const Todo = ({todo, remove}) => {

    return (<a href="#" className="list-group-item" onClick={() => {
        remove(todo.id)
    }}>{todo.description}</a>);

};

const TodoList = ({todos, remove}) => {
    // Map through the todos
    const todoNode = todos.map((todo) => {
        return (<Todo todo={todo} key={todo.id} remove={remove}/>)
    });
    return (<div className="list-group" style={{marginTop: '30px'}}>{todoNode}</div>);
};

// Container Component for todos

class TodoApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        };
        this.apiUrl = 'http://localhost:8913/todos';
        this.loginUrl = 'http://localhost:8913/login';
        this.registerUrl = 'http://localhost:8913/users'
    }

    componentDidUpdate() {
        if (this.state.isLoggedin) {
            // Fetch data from Java backend
            axios.get(this.apiUrl + "/" + this.state.userId)
                .then((res) => {
                    // avoid continuously fetching data
                    if (JSON.stringify(this.state.data) !== JSON.stringify(res.data.todoList)) {
                        // Set state with result
                        this.setState({data: res.data.todoList});
                    }
                });
        }
    }

    // Add todo function
    addTodo(val) {

        const todo = {
            createdByUserUuid: this.state.userId,
            description: val
        };

        axios.post(this.apiUrl, todo)
            .then((res) => {

                const newTodo = {
                    id: res.data.id,
                    description: val
                };
                this.state.data.push(newTodo);
                this.setState({data: this.state.data});
            });
    }

    // Login function
    login(data) {

        axios.post(this.loginUrl, data)
            .then(({status, data}) => {
                this.setState({
                    isLoggedin: status === 200,
                    userId: data.id
                });
            }).catch(err => {
            this.setState({isRegistered: false})
            console.log('error occured on login');
        })
    }

    register(data) {

        axios.post(this.registerUrl, data)
            .then(({status}) => {
                this.setState({isRegistered: status === 201});
            }).catch(err => {
            console.log('Error occured on register');
        })
    }

    skipRegister() {
        this.setState({isRegistered: true});
    }

    // Remove todo function
    handleRemove(id) {
        // Filter all todos except the one to be removed
        const remainder = this.state.data.filter((todo) => {
            if (todo.id !== id) return todo;
        });

        // Update state with filter
        axios.delete(this.apiUrl + '/' + id)
            .then((res) => {
                this.setState({data: remainder});
            })
    }

    render() {

        if (!this.state.isRegistered) {
            return (
                <Register register={this.register.bind(this)}
                          skipRegister={this.skipRegister.bind(this)}/>
            )
        }


        let content = this.state.isLoggedin ? (
            <div>
                <Title todoCount={this.state.data.length}/>
                <TodoForm addTodo={this.addTodo.bind(this)}/>
                <TodoList
                    todos={this.state.data}
                    remove={this.handleRemove.bind(this)}
                />
            </div>
        ) : (
            <div>
                <Login login={this.login.bind(this)}/>
            </div>
        );
        return (
            <div>
                {content}
            </div>
        );
    }
}

render(<TodoApp/>, document.getElementById('container'));

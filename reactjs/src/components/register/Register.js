import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import http from "../../plugins/http";
import { setUserEmail, setUserId } from "../../redux/User";
import Button from "../button/Button";

const RegisterUserComp = () => {
    const emailRef = useRef();
    const password1Ref = useRef();
    const password2Ref = useRef();
    const navigate = useNavigate();

    const [getResponse, setResponse] = useState("");
    const [getInRequest, setInRequest] = useState(false);

    async function registerUser() {
        setInRequest(true);
        setResponse("");

        http.post(
            {
                email: emailRef.current.value,
                password1: password1Ref.current.value,
                password2: password1Ref.current.value,
            },
            "register-user"
        )
            .then((res) => {
                if (res.error) {
                    setInRequest(false);
                    setResponse(res.message);
                } else {
                    setInRequest(false);
                    setResponse(res.message);
                }
            })
            .catch((err) => {
                setInRequest(false);
                setResponse(err);
            });
    }

    return (
        <div className="box d-flex flex-column align-items-center">
            <div
                className="d-flex flex-column justify-content-center"
                style={{ width: "250px" }}
            >
                <h2 className="text-center">Register user</h2>
                <input
                    ref={emailRef}
                    type="email"
                    className={`mt-3 ${getInRequest && "disabled"}`}
                    placeholder="Email"
                />
                <input
                    ref={password1Ref}
                    type="password"
                    className={`mt-3 ${getInRequest && "disabled"}`}
                    placeholder="Password"
                />
                <input
                    ref={password2Ref}
                    type="password"
                    className={`mt-3 ${getInRequest && "disabled"}`}
                    placeholder="Repeat password"
                />

                <Button
                    onClick={() => registerUser()}
                    className={`mt-3 ${getInRequest && "disabled"}`}
                >
                    Register
                </Button>
            </div>
            <div>
                {getResponse && getResponse.length > 0 && (
                    <div
                        className="alert alert-light mt-3"
                        role="alert"
                    >
                        {getResponse}
                    </div>
                )}

                <div className="mt-2 text-center">
                    <Link
                        to={"/login"}
                        className="small text-black-50"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterUserComp;

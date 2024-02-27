import React, { useState } from "react";
import { Col, Row, Button, FormGroup, Input } from "reactstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { storeUser } from "../../helpers";
import 'react-toastify/dist/ReactToastify.css';

const initialUser = { password: "", identifier: "" };

const Login = () => {
  const [user, setUser] = useState(initialUser);
  const navigate = useNavigate();

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setUser((currentUser) => ({
      ...currentUser,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    const url = `http://localhost:1337/api/auth/local`;
    try {
      if (user.identifier && user.password) {
        const { data } = await axios.post(url, user);
        if (data.jwt) {
          storeUser(data);
          toast.success("Logged in successfully!", {
            hideProgressBar: false,
          });
          setUser(initialUser);
          navigate("/");
          //console.log('data from API: ', data.user.username);
          // Gửi yêu cầu lấy địa chỉ IP của máy khách đến một endpoint trên server
          const loginStatus = data ? true : false;
          // Lưu log đăng nhập vào API login-logs
          const loginLog = {
            data: {
              username: data.user.username,
              loginTime: new Date().toISOString(),
              ipAddress: "", // Bạn có thể lấy địa chỉ IP từ máy khách nếu cần
              loginStatus: loginStatus,
              deviceType: "iPhone" // Bạn có thể thêm thông tin về loại thiết bị nếu cần    }
            }
          }
          await axios.post("http://localhost:1337/api/login-logs", loginLog);
        }
      }
    } catch (error) {
      toast.error("Incorrect username or password. Please try again.", {
        hideProgressBar: false,
      });
    }
  };

  return (
    <Row className="login">
      <Col sm="12" md={{ size: 4, offset: 4 }}>
        <div>
          <h2>Login:</h2>
          <FormGroup>
            <Input
              type="email"
              name="identifier"
              value={user.identifier}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </FormGroup>
          <FormGroup>
            <Input
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
          </FormGroup>
          <Button color="primary" onClick={handleLogin}>Login</Button>
          <h6>
            Click <Link to="/registration">Here</Link> to sign up
          </h6>
        </div>
      </Col>
    </Row>
  );
};

export default Login;

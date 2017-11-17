package com.demo.controller;

import com.demo.entity.User;
import com.demo.service.UserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

@RestController
public class LoginController {
    @Autowired
    private UserDetailsService userService;

    @PostMapping("/login")
    public User validateLogin(HttpServletRequest request){
        String userName = request.getParameter("username");
        String password = request.getParameter("password");
        userService.loadUserByUsername(userName, password);
        User user = new User();
        user.setName(userName);
        user.setToken(userName);
        return user;
    }
}

package com.demo.controller;

import com.demo.entity.LoginForm;
import com.demo.entity.SysUser;
import com.demo.entity.User;
import com.demo.service.UserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
public class LoginController {
    @Autowired
    private UserDetailsService userService;

    @PostMapping("/login")
    public Map<String, Object> validateLogin(@RequestBody LoginForm loginForm, HttpSession session) {
        String userName = loginForm.getUsername();
        String password = loginForm.getPassword();
        String captcha = loginForm.getCaptcha();
        boolean isExist = userService.loadUserByUsername(userName, password);
        Map<String, Object> responseResult = new HashMap<>();
        if(isExist) {
            User user = new User();
            user.setToken(userName);
            responseResult.put("user", user);
        }
        String rightCode = (String)session.getAttribute("session_imageCode");
        responseResult.put("verifycode", rightCode.equalsIgnoreCase(captcha));
        responseResult.put("flag", isExist);
        return responseResult;
    }

    @RequestMapping("/user/info")
    public User getUserDetail(@RequestParam("token") String token) {
        SysUser user = userService.getUser(token);
        User customer = null;
        if (user != null) {
            customer = new User();
            customer.setUsername(token);
            customer.setRole("admin");
            customer.setAvatar("https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif");
        }
        return customer;
    }

    @RequestMapping("/logout")
    public String logout() {
        return "success";
    }

}

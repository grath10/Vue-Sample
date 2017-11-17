package com.demo.controller;

import com.demo.tools.VerifyCodeUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@RestController
public class ImageController {
    @RequestMapping("/imagecode")
    public void getImage(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
        response.setHeader("Pragma", "No-cache");
        response.setHeader("Cache-Control", "no-cache");
        response.setDateHeader("Expires", 0);
        response.setContentType("image/jpeg");

        String verifyCode = VerifyCodeUtils.generateVerifyCode(4);
        HttpSession session = request.getSession(true);
        session.setAttribute("session_imageCode", verifyCode.toLowerCase());
        session.setAttribute("session_imageTime", System.currentTimeMillis() + "");

        int width = 200, height = 80;
        VerifyCodeUtils.outputImage(width, height, response.getOutputStream(), verifyCode);
    }
}

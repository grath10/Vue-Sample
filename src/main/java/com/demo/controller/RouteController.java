package com.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class RouteController {
    @RequestMapping(value = {"/","home"})
    public String home(){
        return "home";
    }

    @RequestMapping("index")
    public String index() {return "index";}

    @GetMapping("login")
    public String login(){
        return "login";
    }

    @GetMapping("rule")
    public String rule(){
        return "rule";
    }

    @GetMapping("logout")
    public String logout(){
        return "redirect:/login";
    }
}

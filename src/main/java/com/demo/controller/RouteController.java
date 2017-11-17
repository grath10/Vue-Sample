package com.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RouteController {
    /*@RequestMapping(value = {"/","home"})
    @ResponseBody
    public String home(){
        return "home";
    }*/

/*    @RequestMapping("index")
    public String index() {return "index";}*/

    /*@RequestMapping(value = "login", method = RequestMethod.POST)
    public String login(){
        return "";
    }*/

    @GetMapping("rule")
    public String rule(){
        return "rule";
    }

    @GetMapping("logout")
    public String logout(){
        return "redirect:/login";
    }
}

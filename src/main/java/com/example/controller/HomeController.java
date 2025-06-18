package com.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

import com.example.controller.util.EsRest;

@Controller
public class HomeController {

//    @GetMapping("/")
//    public String home() {
//        return "redirect:/index.html"; // 정적 파일로 리디렉트
//    }
    @GetMapping("/")
    public String home() {
        return "test"; // index.html 반환 (redirect 삭제)
    }
}

package com.ryz.websocket;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;

/**
 * @ClassName
 * @Description TODO
 * @Author 15712
 * @Date 2022/9/29 9:17
 * @Version 1.0
 **/
@Controller
@RequestMapping("/main")
public class ComController {

    @RequestMapping(value = "/index0", method = RequestMethod.GET)
    public String index0() {
        return "index";
    }

    @RequestMapping(value = "/index", method = RequestMethod.GET)
    public String index(ModelMap map, @RequestParam String myName,@RequestParam String friendName) {
        map.addAttribute("myName",myName);
        map.addAttribute("friendName",friendName);
        return "sudu";
    }

    @RequestMapping(value = "/gobang", method = RequestMethod.GET)
    public String gobang(ModelMap map, @RequestParam String myName,@RequestParam String friendName) {
        map.addAttribute("myName",myName);
        map.addAttribute("friendName",friendName);
        return "gobang";
    }
}

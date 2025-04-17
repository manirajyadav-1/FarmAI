package com.crop.Crop.Disease.Detection.controller;

import com.crop.Crop.Disease.Detection.Dto.LoginDto;
import com.crop.Crop.Disease.Detection.Dto.PromptRequest;
import com.crop.Crop.Disease.Detection.loginresponse.LoginResponse;
import com.crop.Crop.Disease.Detection.model.History;
import com.crop.Crop.Disease.Detection.model.User;
import com.crop.Crop.Disease.Detection.repository.UserRepository;
import com.crop.Crop.Disease.Detection.service.ChatGPTService;
import com.crop.Crop.Disease.Detection.service.HistoryService;
import com.crop.Crop.Disease.Detection.service.JWTService;
import com.crop.Crop.Disease.Detection.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private HistoryService historyService;

    private final ChatGPTService chatService;

    @Autowired
    public UserController(ChatGPTService chatService){
        this.chatService = chatService;
    }



    @PostMapping("/auth/signup")
    public ResponseEntity<User> postMethodName(@RequestBody User user) {
        User user2 = userService.signup(user);
        return ResponseEntity.ok(user2);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> loginUser(@RequestBody LoginDto loginDto) {

        User user = userService.loginUser(loginDto);

        String jwtToken = jwtService.generateToken(new HashMap<>(), user);

        LoginResponse loginResponse = new LoginResponse();

        loginResponse.setToken(jwtToken);
        loginResponse.setTokenExpireTime(jwtService.getExpirationTime());

        return ResponseEntity.ok(loginResponse);

    }


    @GetMapping("/auth/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = JWTService.extractUsername(token);

        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/api/history")
    public ResponseEntity<?> saveHistory(
            @RequestPart("image") MultipartFile image,
            @RequestPart("history") String historyJson,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            History history = objectMapper.readValue(historyJson, History.class);

            historyService.saveHistory(history, image, userDetails.getUsername());

            return ResponseEntity.ok("Saved");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error saving history");
        }
    }

    @GetMapping("/api/history")
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal UserDetails userDetails){
        try{
            String email = userDetails.getUsername();
            User user = userService.getUserByEmail(email);

            if(user == null){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            return ResponseEntity.ok(user.getHistory());
        } catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching history");
        }
    }

    @PostMapping("/api/chat")
    public ResponseEntity<String> chat(@RequestBody PromptRequest promptRequest) {
        String response = chatService.getChatResponse(promptRequest);
        return ResponseEntity.ok(response);
    }
}

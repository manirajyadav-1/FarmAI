package com.crop.Crop.Disease.Detection.service;

import com.crop.Crop.Disease.Detection.model.History;
import com.crop.Crop.Disease.Detection.model.User;
import com.crop.Crop.Disease.Detection.repository.HistoryRepository;
import com.crop.Crop.Disease.Detection.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class HistoryService {

    @Autowired
    private HistoryRepository historyRepository;

    @Autowired
    private UserRepository userRepository;

    public void saveHistory(History history, MultipartFile image, String username) throws IOException {
        history.setUsername(username);
        history.setImageBytes(image.getBytes());
        historyRepository.save(history);
        User user = userRepository.findByEmail(username).orElseThrow(() -> new RuntimeException("User not found"));
        user.addToHistory(history);
        userRepository.save(user);
    }
}


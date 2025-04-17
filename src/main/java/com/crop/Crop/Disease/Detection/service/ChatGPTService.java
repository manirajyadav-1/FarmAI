package com.crop.Crop.Disease.Detection.service;

import com.crop.Crop.Disease.Detection.Dto.ChatGPTRequest;
import com.crop.Crop.Disease.Detection.Dto.ChatGPTResponse;
import com.crop.Crop.Disease.Detection.Dto.PromptRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class ChatGPTService {

    private final RestClient restClient;

    public ChatGPTService(RestClient restClient) {
        this.restClient = restClient;
    }

    @Value("${openapi.api.key}")
    private String apiKey;

    @Value("${openapi.api.model}")
    private String model;

    public String getChatResponse(PromptRequest promptRequest) {
        ChatGPTRequest chatRequest = new ChatGPTRequest(
                model,
                List.of(new ChatGPTRequest.Message("user", promptRequest.prompt()))
        );

        try {
            ChatGPTResponse response = restClient.post()
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .body(chatRequest)
                    .retrieve()
                    .body(ChatGPTResponse.class);

            if (response != null && response.choices() != null && !response.choices().isEmpty()) {
                return response.choices().get(0).message().content();
            } else {
                return "No response received from ChatGPT.";
            }
        } catch (Exception e) {
            return "Error occurred while getting response: " + e.getMessage();
        }
    }
}
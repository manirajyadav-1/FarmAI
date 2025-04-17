package com.crop.Crop.Disease.Detection.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "history")
public class History {
    @Id
    private String id;

    private String username;
    private String disease;
    private String geminiInsights;
    private byte[] imageBytes;

    public History(){}

    public History(String username, String disease, String geminiInsights, byte[] imageBytes) {
        this.username = username;
        this.disease = disease;
        this.geminiInsights = geminiInsights;
        this.imageBytes = imageBytes;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDisease() {
        return disease;
    }

    public void setDisease(String disease) {
        this.disease = disease;
    }

    public String getGeminiInsights() {
        return geminiInsights;
    }

    public void setGeminiInsights(String geminiInsights) {
        this.geminiInsights = geminiInsights;
    }

    public byte[] getImageBytes() {
        return imageBytes;
    }

    public void setImageBytes(byte[] imageBytes) {
        this.imageBytes = imageBytes;
    }
}

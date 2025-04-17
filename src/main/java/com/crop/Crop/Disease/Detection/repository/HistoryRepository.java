package com.crop.Crop.Disease.Detection.repository;

import com.crop.Crop.Disease.Detection.model.History;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface HistoryRepository extends MongoRepository<History, String> {
}
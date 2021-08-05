CREATE TABLE `DRS_sheets` (
  `sheet_id` int NOT NULL AUTO_INCREMENT,
  `time` datetime DEFAULT NULL,
  `owner` varchar(45) DEFAULT NULL,
  `location` varchar(45) DEFAULT NULL,
  `reporter` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`sheet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 #COLLATE=utf8mb4_0900_ai_ci
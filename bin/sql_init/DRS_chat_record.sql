CREATE TABLE `DRS_chat_record` (
  `msg_id` int NOT NULL AUTO_INCREMENT,
  `from_uid` int DEFAULT NULL,
  `msg_from` varchar(45) DEFAULT NULL,
  `msg_to` varchar(45) DEFAULT NULL,
  `msg` text,
  `time` datetime DEFAULT NULL,
  PRIMARY KEY (`msg_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 #--COLLATE=utf8mb4_0900_ai_ci
CREATE TABLE `DRS_bulletin` (
  `bulletin_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(30) DEFAULT NULL,
  `content` text,
  `time` datetime DEFAULT NULL,
  `m_time` datetime DEFAULT NULL,
  `poster` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`bulletin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 #--COLLATE=utf8mb4_0900_ai_ci
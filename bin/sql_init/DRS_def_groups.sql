CREATE TABLE `DRS_def_groups` (
  `dgs_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) DEFAULT NULL,
  `visible` tinyint DEFAULT '1',
  PRIMARY KEY (`dgs_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
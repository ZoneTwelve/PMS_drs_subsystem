CREATE TABLE `DRS_def_sheet_cols` (
  `dsc_id` int NOT NULL AUTO_INCREMENT,
  `group_id` int DEFAULT NULL,
  `title` varchar(20) DEFAULT NULL,
  `state` text,
  `datatype` varchar(10) DEFAULT 'boolean',
  PRIMARY KEY (`dsc_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
CREATE TABLE `DRS_sheet_cols` (
  `col_id` int PRIMARY KEY AUTO_INCREMENT,
  `sheet_id` int,
  `form_id` int,
  `title` varchar(20),
  `state` text,
  `notes` text
);

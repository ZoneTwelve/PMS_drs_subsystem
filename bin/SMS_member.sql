CREATE TABLE `SMS_member` (
  `no` int NOT NULL AUTO_INCREMENT,
  `name` varchar(10) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `username` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `password` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `blood` varchar(2) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `tel` varchar(15) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `cellphone` varchar(15) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `address` varchar(200) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `contact` varchar(10) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `contact_tel` varchar(15) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `relation` varchar(10) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `record` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `authority` varchar(1) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `authority2` varchar(1) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT '0',
  `authority3` varchar(1) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT '0',
  `authority4` varchar(1) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT '0',
  `vacation` int NOT NULL DEFAULT '0',
  `read_date` date DEFAULT NULL,
  PRIMARY KEY (`no`)
) ENGINE=MyISAM AUTO_INCREMENT=495 DEFAULT CHARSET=utf8mb3 COLLATE=utf8_unicode_ci COMMENT='SMS_人員權限'

/*
# no, name, username, password, blood, tel, cellphone, address, contact, contact_tel, relation, record, authority, authority2, authority3, authority4, vacation, read_date
493, 開發者, dev, password, A, , , , , , , , 0, 0, 0, 0, 0, 2021-06-08
494, developer, developer, password, A, , , , , , , , 3, 0, 0, 0, 0, 2021-06-08

*/
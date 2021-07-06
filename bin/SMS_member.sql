-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jul 05, 2021 at 03:18 AM
-- Server version: 10.4.10-MariaDB-log
-- PHP Version: 7.4.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ncu7221`
--

-- --------------------------------------------------------

--
-- Table structure for table `SMS_member`
--

CREATE TABLE `SMS_member` (
  `no` int(11) NOT NULL,
  `name` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `username` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `password` text COLLATE utf8_unicode_ci NOT NULL,
  `blood` varchar(2) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tel` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL,
  `cellphone` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL,
  `address` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `contact` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `contact_tel` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL,
  `relation` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `record` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `authority` varchar(1) COLLATE utf8_unicode_ci NOT NULL,
  `authority2` varchar(1) COLLATE utf8_unicode_ci NOT NULL DEFAULT '0',
  `authority3` varchar(1) COLLATE utf8_unicode_ci NOT NULL DEFAULT '0',
  `authority4` varchar(1) COLLATE utf8_unicode_ci NOT NULL DEFAULT '0',
  `vacation` int(2) NOT NULL DEFAULT 0,
  `read_date` date DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='SMS_人員權限';

--
-- Dumping data for table `SMS_member`
--

INSERT INTO `SMS_member` (`no`, `name`, `username`, `password`, `blood`, `tel`, `cellphone`, `address`, `contact`, `contact_tel`, `relation`, `record`, `authority`, `authority2`, `authority3`, `authority4`, `vacation`, `read_date`) VALUES
(493, '開發者', 'dev', 'password', 'A', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '3', '0', '0', '0', 0, '2021-06-08');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `SMS_member`
--
ALTER TABLE `SMS_member`
  ADD PRIMARY KEY (`no`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `SMS_member`
--
ALTER TABLE `SMS_member`
  MODIFY `no` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=494;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

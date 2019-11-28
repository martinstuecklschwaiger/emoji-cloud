
create table emoji (
  `id` int primary key NOT NULL AUTO_INCREMENT,
  `time` datetime NOT NULL DEFAULT NOW(),
  `checkin_id` INT NOT NULL,
  `emoji` varchar(10)
);

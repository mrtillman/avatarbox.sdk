use gravatar;

CREATE TABLE `users` (
  `id` bigint NOT NULL,
  `hash` varchar(100) DEFAULT NULL,
  `secret` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `hash_UNIQUE` (`hash`)
);

use gravatar;

CREATE TABLE `users` (
  `id` bigint NOT NULL,
  `hash` varchar(100) DEFAULT NULL,
  `secret` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `hash_UNIQUE` (`hash`)
);

CREATE USER 'Auth0Integration'@'%' IDENTIFIED BY '{{password}}';

ALTER USER 'Auth0Integration' IDENTIFIED BY '{{password}}';
GRANT SELECT ON gravatar.users TO 'Auth0Integration'@'%';
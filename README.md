Objet : AKHQ dev inaccessible depuis le VPN (proxy en 503)

Bonjour,

Je n'arrive pas à accéder à https://evtstreamspltfrm-akhq.pf.dev.echonet:8443 depuis mon poste (PARWX0236456, compte h93596), alors que le reste de l'équipe y accède.

Mon poste semble hors de cause :

	•	VPN « France with SmartCard » connecté, ticket Kerberos valide, Preproxy actif.
	•	Via Preproxy, Google répond normalement (200), mais AKHQ renvoie CONNECT tunnel failed, response 503.
	•	En direct depuis le VPN (IP 11.144.140.195), 10.229.66.64 ne répond sur aucun port.

Le proxy accepte bien la demande, mais n'arrive pas à joindre le serveur.

Pourriez-vous vérifier si cette URL est accessible depuis le VPN, ou m'indiquer l'équipe à contacter ?

Merci,
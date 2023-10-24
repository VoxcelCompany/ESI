const HELP_FIELDS = [
    {
        name: `/edt {semaine} (section)`,
        value: `Permet de récupérer l'emploi du temps sélectionné. Trois semaines vous serront proposés lors de l'entrée de la commande, à savoir qu'à partir de samedi la semaine actuelle est considérée comme étant la semaine du lundi suivant. La section est un paramètre optionnel.`,
    },
    {
        name: `/osi {option}`,
        value: `Permet de récupérer le mémo OSI. Deux options vous sont proposés, soit le mémo sous forme d'image, soit le mémo sous forme de texte qui est lui beaucoup plus simple à retenir...`,
    },
    {
        name: `/wifi`,
        value: `Permet de récupérer les informations à propos de la connexion internet d'ENIGMA.`,
    },
    {
        name: `/info`,
        value: `Permet de récupérer le ping des différents API utilisés ainsi que la version du bot.`,
    },
    {
        name: `Et en bonus`,
        value: `Bien du plaisir...\n­`,
    },
];

export default HELP_FIELDS;

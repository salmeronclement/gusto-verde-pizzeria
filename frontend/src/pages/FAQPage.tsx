import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqItems = [
    {
        question: "Y a-t-il un montant minimum pour la livraison ?",
        answer: "Pour les 1er, 2e, 3e, 4e, 5e, 6e, 7e, 8e, et 10e arrondissements, aucune commande minimale n'est requise pour bénéficier de la livraison gratuite.\n\nDans le 9e arrondissement et Les Goudes, la livraison est gratuite à partir de 2 pizzas. Sinon, des frais de livraison de 3€ s'appliquent.\n\nPour les 11e et 12e arrondissements, les frais de livraison sont de 5€, mais ils sont offerts à partir de 5 pizzas."
    },
    {
        question: "Acceptez-vous les tickets restaurant ?",
        answer: "Nous acceptons les tickets restaurant pour les commandes en livraison et à emporter."
    },
    {
        question: "Proposez-vous des réductions pour les grandes commandes ?",
        answer: "Oui, pour les commandes importantes, veuillez nous contacter pour discuter des remises possibles."
    },
    {
        question: "Quels sont vos horaires d'ouverture ?",
        answer: "Nous sommes ouverts du lundi au jeu de 17h30 à 22h, et du vendredi au dimanche de 17h30 à 22h15."
    },
    {
        question: "Puis-je personnaliser ma pizza ?",
        answer: "Bien sûr ! Vous pouvez créer votre pizza idéale en choisissant parmi nos nombreux ingrédients."
    },
    {
        question: "Vos pizzas sont-elles cuites au feu de bois ?",
        answer: "Oui, toutes nos pizzas sont cuites sur pierre dans un four traditionnel au feu de bois pour cette saveur authentique que vous adorez."
    },
    {
        question: "Proposez-vous des options végétariennes ?",
        answer: "Absolument ! Nous avons une sélection de pizzas végétariennes délicieuses, garnies de légumes frais et d'ingrédients de qualité.\nVous pouvez également personnaliser votre pizza selon vos envies."
    },
    {
        question: "Acceptez-vous les paiements par carte bancaire ?",
        answer: "Oui, nous acceptons les paiements par carte bancaire. Veuillez simplement le préciser lors de la passation de votre commande par téléphone afin que nous puissions organiser le paiement de manière appropriée."
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Page Header */}
            <div className="bg-dark py-16">
                <div className="container-custom text-center">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">FAQ</h1>
                    <div className="flex justify-center gap-2 text-sm text-gray-400">
                        <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <span>/</span>
                        <span className="text-white">FAQ</span>
                    </div>
                </div>
            </div>

            <section className="py-20">
                <div className="container-custom">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Accordion */}
                        <div className="w-full lg:w-1/2">
                            <div className="space-y-4">
                                {faqItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`border rounded-lg overflow-hidden transition-all duration-300 ${openIndex === index ? 'border-primary shadow-sm' : 'border-gray-200'
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleAccordion(index)}
                                            className={`w-full flex items-center justify-between p-5 text-left font-display font-bold text-lg transition-colors ${openIndex === index ? 'bg-primary text-white' : 'bg-white text-dark hover:bg-gray-50'
                                                }`}
                                        >
                                            {item.question}
                                            {openIndex === index ? (
                                                <ChevronUp size={20} />
                                            ) : (
                                                <ChevronDown size={20} />
                                            )}
                                        </button>
                                        <div
                                            className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                                }`}
                                        >
                                            <div className="p-5 bg-white text-gray-600 whitespace-pre-line">
                                                {item.answer}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image */}
                        <div className="w-full lg:w-1/2">
                            <div className="sticky top-24">
                                <div className="relative h-[600px] bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">
                                        <span className="text-lg font-medium">Image à rajouter</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

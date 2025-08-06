import type { Question, QuizCategoryInfo } from '../types/quiz';

export const questions: Question[] = [
  // History Questions
  {
    id: 1,
    question: "In which year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correctAnswer: 2,
    category: "history",
    difficulty: "easy",
    explanation: "World War II ended in 1945 with the surrender of Germany in May and Japan in September."
  },
  {
    id: 2,
    question: "Who was the first President of the United States?",
    options: ["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"],
    correctAnswer: 2,
    category: "history",
    difficulty: "easy",
    explanation: "George Washington served as the first President of the United States from 1789 to 1797."
  },
  {
    id: 3,
    question: "Which ancient wonder was located in Alexandria, Egypt?",
    options: ["Colossus of Rhodes", "Lighthouse of Alexandria", "Temple of Artemis", "Hanging Gardens"],
    correctAnswer: 1,
    category: "history",
    difficulty: "medium",
    explanation: "The Lighthouse of Alexandria was one of the Seven Wonders of the Ancient World."
  },
  {
    id: 4,
    question: "In which year did the Berlin Wall fall?",
    options: ["1987", "1989", "1991", "1993"],
    correctAnswer: 1,
    category: "history",
    difficulty: "medium",
    explanation: "The Berlin Wall fell on November 9, 1989, marking the beginning of German reunification."
  },
  {
    id: 5,
    question: "Who was the last Tsar of Russia?",
    options: ["Nicholas I", "Alexander II", "Nicholas II", "Alexander III"],
    correctAnswer: 2,
    category: "history",
    difficulty: "hard",
    explanation: "Nicholas II was the last Tsar of Russia, ruling from 1894 until his abdication in 1917."
  },

  // Math Questions
  {
    id: 6,
    question: "What is the value of π (pi) to two decimal places?",
    options: ["3.12", "3.14", "3.16", "3.18"],
    correctAnswer: 1,
    category: "math",
    difficulty: "easy",
    explanation: "π (pi) is approximately 3.14159, so to two decimal places it's 3.14."
  },
  {
    id: 7,
    question: "What is the square root of 144?",
    options: ["10", "11", "12", "13"],
    correctAnswer: 2,
    category: "math",
    difficulty: "easy",
    explanation: "12 × 12 = 144, so the square root of 144 is 12."
  },
  {
    id: 8,
    question: "What is the sum of the first 10 natural numbers?",
    options: ["45", "50", "55", "60"],
    correctAnswer: 2,
    category: "math",
    difficulty: "medium",
    explanation: "The sum of first n natural numbers is n(n+1)/2. For n=10: 10×11/2 = 55."
  },
  {
    id: 9,
    question: "What is the derivative of x²?",
    options: ["x", "2x", "x²", "2x²"],
    correctAnswer: 1,
    category: "math",
    difficulty: "medium",
    explanation: "The derivative of x² is 2x using the power rule."
  },
  {
    id: 10,
    question: "What is the value of e (Euler's number) to two decimal places?",
    options: ["2.69", "2.71", "2.73", "2.75"],
    correctAnswer: 1,
    category: "math",
    difficulty: "hard",
    explanation: "e (Euler's number) is approximately 2.71828, so to two decimal places it's 2.71."
  },

  // Science Questions
  {
    id: 11,
    question: "What is the chemical symbol for gold?",
    options: ["Ag", "Au", "Fe", "Cu"],
    correctAnswer: 1,
    category: "science",
    difficulty: "easy",
    explanation: "Au comes from the Latin word 'aurum' which means gold."
  },
  {
    id: 12,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    category: "science",
    difficulty: "easy",
    explanation: "Mars is called the Red Planet due to its reddish appearance caused by iron oxide on its surface."
  },
  {
    id: 13,
    question: "What is the hardest natural substance on Earth?",
    options: ["Steel", "Diamond", "Granite", "Quartz"],
    correctAnswer: 1,
    category: "science",
    difficulty: "medium",
    explanation: "Diamond is the hardest natural substance, scoring 10 on the Mohs scale of mineral hardness."
  },
  {
    id: 14,
    question: "What is the speed of light in vacuum?",
    options: ["299,792 km/s", "199,792 km/s", "399,792 km/s", "499,792 km/s"],
    correctAnswer: 0,
    category: "science",
    difficulty: "medium",
    explanation: "The speed of light in vacuum is approximately 299,792 kilometers per second."
  },
  {
    id: 15,
    question: "What is the atomic number of carbon?",
    options: ["4", "6", "8", "12"],
    correctAnswer: 1,
    category: "science",
    difficulty: "hard",
    explanation: "Carbon has an atomic number of 6, meaning it has 6 protons in its nucleus."
  },

  // Geography Questions
  {
    id: 16,
    question: "What is the capital of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    correctAnswer: 2,
    category: "geography",
    difficulty: "easy",
    explanation: "Canberra is the capital of Australia, not Sydney which is the largest city."
  },
  {
    id: 17,
    question: "Which is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"],
    correctAnswer: 2,
    category: "geography",
    difficulty: "easy",
    explanation: "The Pacific Ocean is the largest and deepest ocean on Earth."
  },
  {
    id: 18,
    question: "What is the longest river in the world?",
    options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
    correctAnswer: 1,
    category: "geography",
    difficulty: "medium",
    explanation: "The Nile River is the longest river in the world at approximately 6,650 km."
  },
  {
    id: 19,
    question: "Which mountain range runs through South America?",
    options: ["Rocky Mountains", "Andes", "Alps", "Himalayas"],
    correctAnswer: 1,
    category: "geography",
    difficulty: "medium",
    explanation: "The Andes is the longest continental mountain range in the world, running through South America."
  },
  {
    id: 20,
    question: "What is the smallest country in the world?",
    options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"],
    correctAnswer: 2,
    category: "geography",
    difficulty: "hard",
    explanation: "Vatican City is the smallest country in the world by both area and population."
  },

  // Literature Questions
  {
    id: 21,
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctAnswer: 1,
    category: "literature",
    difficulty: "easy",
    explanation: "William Shakespeare wrote the famous tragedy 'Romeo and Juliet' in the late 16th century."
  },
  {
    id: 22,
    question: "What is the name of the wizard in 'The Lord of the Rings'?",
    options: ["Merlin", "Gandalf", "Dumbledore", "Saruman"],
    correctAnswer: 1,
    category: "literature",
    difficulty: "easy",
    explanation: "Gandalf is the wizard character in J.R.R. Tolkien's 'The Lord of the Rings' series."
  },
  {
    id: 23,
    question: "Who wrote 'Pride and Prejudice'?",
    options: ["Emily Brontë", "Charlotte Brontë", "Jane Austen", "Mary Shelley"],
    correctAnswer: 2,
    category: "literature",
    difficulty: "medium",
    explanation: "Jane Austen wrote 'Pride and Prejudice', published in 1813."
  },
  {
    id: 24,
    question: "What is the name of the protagonist in 'The Great Gatsby'?",
    options: ["Jay Gatsby", "Nick Carraway", "Tom Buchanan", "Daisy Buchanan"],
    correctAnswer: 1,
    category: "literature",
    difficulty: "medium",
    explanation: "Nick Carraway is the narrator and protagonist of F. Scott Fitzgerald's 'The Great Gatsby'."
  },
  {
    id: 25,
    question: "Who wrote '1984'?",
    options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "H.G. Wells"],
    correctAnswer: 1,
    category: "literature",
    difficulty: "hard",
    explanation: "George Orwell wrote '1984', a dystopian novel published in 1949."
  },

  // Sports Questions
  {
    id: 26,
    question: "Which country has won the most FIFA World Cups?",
    options: ["Germany", "Argentina", "Brazil", "Italy"],
    correctAnswer: 2,
    category: "sports",
    difficulty: "easy",
    explanation: "Brazil has won the FIFA World Cup 5 times, more than any other country."
  },
  {
    id: 27,
    question: "How many players are on a basketball court at once?",
    options: ["8", "10", "12", "14"],
    correctAnswer: 1,
    category: "sports",
    difficulty: "easy",
    explanation: "There are 5 players from each team on the court at once, totaling 10 players."
  },
  {
    id: 28,
    question: "What is the name of the trophy awarded to the winner of the Tour de France?",
    options: ["Yellow Jersey", "Green Jersey", "Polka Dot Jersey", "Maillot Jaune"],
    correctAnswer: 3,
    category: "sports",
    difficulty: "medium",
    explanation: "The Maillot Jaune (Yellow Jersey) is awarded to the overall leader of the Tour de France."
  },
  {
    id: 29,
    question: "Which sport is known as 'The Beautiful Game'?",
    options: ["Basketball", "Tennis", "Soccer", "Baseball"],
    correctAnswer: 2,
    category: "sports",
    difficulty: "medium",
    explanation: "Soccer (football) is often referred to as 'The Beautiful Game' due to its fluid and artistic nature."
  },
  {
    id: 30,
    question: "Who holds the record for most Grand Slam tennis titles?",
    options: ["Roger Federer", "Rafael Nadal", "Novak Djokovic", "Margaret Court"],
    correctAnswer: 3,
    category: "sports",
    difficulty: "hard",
    explanation: "Margaret Court holds the record with 24 Grand Slam singles titles."
  }
];

export const categoryInfo: Record<string, QuizCategoryInfo> = {
  history: {
    name: "History",
    icon: "🏛️",
    color: "#8B4513",
    description: "Journey through time with questions about ancient civilizations, world wars, and historical figures."
  },
  math: {
    name: "Mathematics",
    icon: "🔢",
    color: "#4169E1",
    description: "Test your numerical skills with algebra, geometry, and mathematical concepts."
  },
  science: {
    name: "Science",
    icon: "🔬",
    color: "#32CD32",
    description: "Explore the natural world with questions about chemistry, physics, and biology."
  },
  geography: {
    name: "Geography",
    icon: "🌍",
    color: "#228B22",
    description: "Travel around the world with questions about countries, capitals, and natural wonders."
  },
  literature: {
    name: "Literature",
    icon: "📚",
    color: "#8A2BE2",
    description: "Dive into the world of books, authors, and literary masterpieces."
  },
  sports: {
    name: "Sports",
    icon: "⚽",
    color: "#FF4500",
    description: "Test your knowledge of athletics, games, and sporting achievements."
  }
}; 
# Lingo Bridge - Project Architecture & Pseudocode

Bu döküman, projenin tüm dosyalarının işleyişini sözde kod (pseudocode) formatında açıklar.

---

## 📁 Genel Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                         APP                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Home      │  │   Bridge    │  │  Practice   │   TABS   │
│  │  (index)    │  │             │  │             │          │
│  └──────┬──────┘  └─────────────┘  └──────┬──────┘          │
│         │                                  │                 │
│         ▼                                  ▼                 │
│  ┌─────────────┐                    ┌─────────────┐         │
│  │ flash-cards │                    │    quiz     │  SCREENS│
│  └─────────────┘                    └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
         │                                   │
         ▼                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      COMPONENTS                              │
│  WordCard, StackedCard, QuizQuestion, QuizResults,          │
│  ReviewStats, AddWordModal, ProgressHeader, EmptyState      │
└─────────────────────────────────────────────────────────────┘
         │                                   │
         ▼                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVICES                               │
│         gemini-service.ts    │    srs-service.ts            │
└─────────────────────────────────────────────────────────────┘
         │                                   │
         ▼                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                        STORE                                 │
│                   vocab-store.ts                             │
│                   (Zustand + MMKV)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Types (Tip Tanımları)

### `types/word-card.ts`

```pseudo
INTERFACE SRSState:
    easeFactor: Number      // Hatırlama kolaylığı (2.5 başlangıç, min 1.3)
    interval: Number        // Gün cinsinden tekrar aralığı
    repetitions: Number     // Arka arkaya başarılı tekrar sayısı
    nextReviewDate: Number  // Bir sonraki tekrar zamanı (timestamp)
    lastReviewDate: Number  // Son tekrar zamanı (timestamp)

INTERFACE WordCard:
    id: String              // Benzersiz kimlik (UUID)
    word: String            // İngilizce kelime
    content: WordCardContent
        meaningTr: String       // Türkçe anlam
        context: String         // Günlük hayat bağlamı
        exampleSentence: String // Örnek cümle (**hedef kelime** işaretli)
    createdAt: Number       // Oluşturulma zamanı
    lastContextUpdate: Number // Son bağlam güncelleme zamanı
    masteryLevel: Number    // Ustalık seviyesi (0-5)
    srs: SRSState           // Aralıklı tekrar durumu
```

---

## 🗄️ Store (Durum Yönetimi)

### `store/vocab-store.ts`

```pseudo
// MMKV başlat (yüksek performanslı key-value depolama)
storage = createMMKV()

// Zustand store oluştur
STORE VocabStore:
    STATE:
        words: WordCard[]   // Tüm kelimeler

    ACTIONS:
        addWord(word):
            words = [word, ...words]    // Başa ekle
            PERSIST to MMKV

        removeWord(id):
            words = words.FILTER(w => w.id != id)
            PERSIST to MMKV

        updateWord(id, updates):
            words = words.MAP(w =>
                IF w.id == id THEN {...w, ...updates}
                ELSE w
            )
            PERSIST to MMKV

        getWord(id):
            RETURN words.FIND(w => w.id == id)

        recordReview(id, quality):
            FOR each word in words:
                IF word.id == id:
                    newSRS = calculateNextReview(word.srs, quality)
                    newMastery = MIN(5, FLOOR(newSRS.repetitions / 2))
                    word.srs = newSRS
                    word.masteryLevel = newMastery
            PERSIST to MMKV

    ON_REHYDRATE (uygulama açıldığında):
        // Eski kelimelere SRS ekle
        FOR each word in words:
            IF word.srs == undefined:
                word.srs = getInitialSRSState()
```

---

## 🤖 Services (Servisler)

### `services/gemini-service.ts`

```pseudo
CLASS GeminiService:
    model = GoogleGenerativeAI("gemini-2.5-flash")

    ASYNC generateWordCard(word):
        prompt = WORD_CARD_PROMPT.replace("{word}", word)
        response = AWAIT model.generateContent(prompt)
        json = PARSE response.text

        RETURN {
            meaningTr: json.meaning_tr,
            context: json.context,
            exampleSentence: json.example_sentence
        }

    ASYNC transformToB1(phrase):
        prompt = B1_BRIDGE_PROMPT.replace("{phrase}", phrase)
        response = AWAIT model.generateContent(prompt)
        json = PARSE response.text

        RETURN {
            original: json.original,
            b1Version: json.b1_version,
            explanation: json.explanation
        }

    ASYNC refreshContext(word, currentMeaning):
        prompt = CONTEXT_REFRESH_PROMPT
            .replace("{word}", word)
            .replace("{meaning}", currentMeaning)
        response = AWAIT model.generateContent(prompt)
        json = PARSE response.text

        RETURN {
            context: json.context,
            exampleSentence: json.example_sentence
        }
```

### `services/srs-service.ts`

```pseudo
CONSTANTS:
    MIN_EASE_FACTOR = 1.3
    DEFAULT_EASE_FACTOR = 2.5
    INITIAL_INTERVAL = 1    // gün
    SECOND_INTERVAL = 6     // gün

FUNCTION getInitialSRSState():
    RETURN {
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: NOW(),  // Hemen tekrar için hazır
        lastReviewDate: 0
    }

FUNCTION calculateNextReview(currentSRS, quality):
    // quality: 0-5 arası (0=hiç hatırlamadı, 5=mükemmel)

    // Yeni kolaylık faktörü hesapla
    newEF = currentSRS.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    newEF = MAX(newEF, MIN_EASE_FACTOR)

    IF quality < 3:
        // Başarısız - sıfırla
        newRepetitions = 0
        newInterval = INITIAL_INTERVAL
    ELSE:
        // Başarılı
        newRepetitions = currentSRS.repetitions + 1

        IF newRepetitions == 1:
            newInterval = 1
        ELSE IF newRepetitions == 2:
            newInterval = 6
        ELSE:
            newInterval = ROUND(currentSRS.interval * newEF)

    nextReviewDate = NOW() + (newInterval * 24 * 60 * 60 * 1000)

    RETURN {
        easeFactor: newEF,
        interval: newInterval,
        repetitions: newRepetitions,
        nextReviewDate: nextReviewDate,
        lastReviewDate: NOW()
    }

FUNCTION isWordDueForReview(srs):
    RETURN NOW() >= srs.nextReviewDate

FUNCTION getDueWords(words):
    RETURN words.FILTER(w => isWordDueForReview(w.srs))

FUNCTION sortByReviewPriority(words):
    RETURN words.SORT BY:
        1. En fazla gecikmiş olan önce
        2. En düşük easeFactor (zor kelimeler) önce

FUNCTION mapResultToQuality(isCorrect, wasHesitant = false):
    IF NOT isCorrect: RETURN 2
    IF wasHesitant: RETURN 4
    RETURN 5
```

---

## 🎨 Components (Bileşenler)

### `components/word-card.tsx`

```pseudo
COMPONENT WordCard(card, forcedFlipMode):
    STATE isFlipped = false

    // Flip animasyonu
    flipRotation = useSharedValue(0)

    FUNCTION handleFlip():
        isFlipped = NOT isFlipped
        flipRotation.value = isFlipped ? 180 : 0
        Haptics.impact()

    FUNCTION handleDelete():
        removeWord(card.id)
        Haptics.notification()

    FUNCTION handleRefresh():
        newContent = AWAIT refreshContext(card.word, card.content.meaningTr)
        updateWord(card.id, {
            content: {...card.content, ...newContent},
            lastContextUpdate: NOW()
        })

    // forcedFlipMode değişirse tüm kartları çevir
    EFFECT [forcedFlipMode]:
        IF forcedFlipMode != null:
            isFlipped = (forcedFlipMode == 'back')

    RENDER:
        <Pressable onPress={handleFlip}>
            <AnimatedView rotation={flipRotation}>
                IF showing front:
                    // TÜRKÇE ANLAM
                    <Text>{card.content.meaningTr}</Text>
                    <DeleteButton />
                    <MasteryIndicator level={card.masteryLevel} />
                ELSE:
                    // ÖRNEK CÜMLE
                    <Text>{card.word}</Text>
                    <Text>{highlightWord(card.content.exampleSentence)}</Text>
                    <RefreshButton onClick={handleRefresh} />
                    <DeleteButton />
            </AnimatedView>
        </Pressable>
```

### `components/review-stats.tsx`

```pseudo
COMPONENT ReviewStats:
    words = useVocabStore(state => state.words)

    // İstatistikleri hesapla
    dueWords = getDueWords(words)
    dueCount = dueWords.length

    // En yakın tekrar
    nonDueWords = words.FILTER(w => NOT dueWords.includes(w))
    nextReview = nonDueWords.REDUCE((earliest, word) =>
        word.srs.nextReviewDate < earliest.srs.nextReviewDate ? word : earliest
    )

    // Ortalama ustalık
    avgMastery = ROUND((SUM(words.masteryLevel) / words.length) * 20)

    IF words.length == 0: RETURN null

    RENDER:
        <Card>
            <Title>Review Stats</Title>
            <Row>
                <Stat icon={Clock} value={dueCount} label="Due Now" />
                <Stat icon={Calendar} value={getTimeUntilReview(nextReview.srs)} label="Next Review" />
                <Stat icon={Zap} value={avgMastery + "%"} label="Mastery" />
            </Row>
        </Card>
```

### `components/quiz-question.tsx`

```pseudo
COMPONENT QuizQuestion(question, mode, onAnswer):

    FUNCTION getModeLabel(mode):
        SWITCH mode:
            'tr-to-en': "Türkçe → İngilizce"
            'en-to-tr': "İngilizce → Türkçe"
            'gap-fill': "Boşluk Doldur"

    FUNCTION getQuestionContent():
        SWITCH mode:
            'tr-to-en':
                RETURN question.card.content.meaningTr
            'en-to-tr':
                RETURN highlightWord(question.card.content.exampleSentence)
            'gap-fill':
                sentence = question.card.content.exampleSentence
                RETURN sentence.REPLACE(/\*\*(.+?)\*\*/, "_____")

    RENDER:
        <Card>
            <Badge>{getModeLabel(mode)}</Badge>
            <Text>{getQuestionContent()}</Text>
        </Card>
```

### `components/quiz-results.tsx`

```pseudo
COMPONENT QuizResults(correct, wrong, skipped, onRestart, onExit):
    total = correct + wrong + skipped
    percentage = ROUND((correct / total) * 100)

    // Animasyonlar
    scoreCardStyle = useAnimatedStyle(entering: FadeIn, scale)

    RENDER:
        <Card animated={scoreCardStyle}>
            <ScoreCircle percentage={percentage} />
            <Label>{correct} of {total} correct</Label>

            <Row>
                <Stat icon={Check} value={correct} label="Correct" color="green" />
                <Stat icon={X} value={wrong} label="Wrong" color="red" />
                <Stat icon={SkipForward} value={skipped} label="Skipped" color="gray" />
            </Row>

            <Button onClick={onRestart}>Try Again</Button>
            <Button onClick={onExit}>Exit</Button>
        </Card>
```

---

## 📱 Screens (Ekranlar)

### `app/(tabs)/index.tsx` - Ana Sayfa

```pseudo
SCREEN HomeScreen:
    STATE isModalVisible = false
    STATE forcedFlipMode = null  // 'front' | 'back' | null

    words = useVocabStore(state => state.words)

    FUNCTION handleFlipAll():
        Haptics.impact()
        forcedFlipMode = (forcedFlipMode == 'back') ? 'front' : 'back'

    RENDER:
        <SafeAreaView>
            <Header>
                <Title>Lingo Bridge</Title>
                <Subtitle>{words.length} words</Subtitle>
                <FlipAllButton onClick={handleFlipAll} />
            </Header>

            IF words.length == 0:
                <EmptyState onAddWord={() => isModalVisible = true} />
            ELSE:
                <FlashList
                    data={words}
                    ListHeaderComponent={<ReviewStats />}
                    renderItem={({item}) =>
                        <WordCard card={item} forcedFlipMode={forcedFlipMode} />
                    }
                />
                <FAB onClick={() => isModalVisible = true} />

            <AddWordModal
                visible={isModalVisible}
                onClose={() => isModalVisible = false}
            />
        </SafeAreaView>
```

### `app/(tabs)/practice.tsx` - Pratik Seçimi

```pseudo
SCREEN PracticeScreen:
    words = useVocabStore(state => state.words)
    router = useRouter()

    FUNCTION startQuiz():
        router.push('/quiz')

    FUNCTION startFlashcards():
        router.push('/flash-cards')

    IF words.length == 0:
        RETURN <EmptyState message="No Words Yet" />

    RENDER:
        <View>
            <Title>Practice 📝</Title>
            <Text>Test your vocabulary knowledge</Text>

            <InfoCard>
                <Text>• {words.length} questions in total</Text>
                <Text>• Random question modes</Text>
                <Text>• Score tracked for mastery</Text>
            </InfoCard>

            <Button icon={Layers} onClick={startFlashcards}>
                Flashcards
            </Button>
            <Button icon={Play} onClick={startQuiz}>
                Start Quiz
            </Button>
        </View>
```

### `app/quiz.tsx` - Quiz Ekranı

```pseudo
SCREEN QuizScreen:
    words = useVocabStore(state => state.words)
    recordReview = useVocabStore(state => state.recordReview)

    STATE quiz = {
        isStarted: false,
        queue: [],          // QuestionItem[]
        currentIndex: 0,
        userAnswer: "",
        isAnswered: false,
        isCorrect: false,
        correctCount: 0,
        wrongCount: 0,
        skippedCount: 0,
        isFinished: false
    }

    // Quiz başlat
    EFFECT []:
        IF words.length == 0: RETURN

        // Due kelimeler önce
        dueWords = getDueWords(words)
        sortedDue = sortByReviewPriority(dueWords)
        nonDue = words.FILTER(w => NOT dueWords.includes(w))
        shuffledNonDue = SHUFFLE(nonDue)
        orderedWords = [...sortedDue, ...shuffledNonDue]

        queue = orderedWords.MAP(card => ({
            card: card,
            mode: RANDOM(['tr-to-en', 'en-to-tr', 'gap-fill'])
        }))

        quiz.isStarted = true
        quiz.queue = queue

    FUNCTION checkAnswer():
        currentQ = quiz.queue[quiz.currentIndex]

        // Cevabı kontrol et
        correct = false
        SWITCH currentQ.mode:
            'tr-to-en':
                correct = userAnswer == targetWord OR userAnswer == baseWord
            'en-to-tr':
                correct = userAnswer in meaningTr.split(',')
            'gap-fill':
                correct = userAnswer == targetWord OR userAnswer == baseWord

        // SRS güncelle
        quality = mapResultToQuality(correct)
        recordReview(currentQ.card.id, quality)

        // Haptic feedback
        IF correct:
            Haptics.notificationSuccess()
        ELSE:
            Haptics.notificationError()
            triggerShakeAnimation()

        quiz.isAnswered = true
        quiz.isCorrect = correct
        quiz.correctCount += correct ? 1 : 0
        quiz.wrongCount += correct ? 0 : 1

    FUNCTION nextQuestion():
        IF quiz.currentIndex >= quiz.queue.length - 1:
            quiz.isFinished = true
        ELSE:
            quiz.currentIndex++
            quiz.userAnswer = ""
            quiz.isAnswered = false

    FUNCTION skipQuestion():
        quiz.skippedCount++
        nextQuestion()

    RENDER:
        IF words.length == 0:
            <EmptyState />
        ELSE IF quiz.isFinished:
            <QuizResults
                correct={quiz.correctCount}
                wrong={quiz.wrongCount}
                skipped={quiz.skippedCount}
                onRestart={restartQuiz}
                onExit={router.back}
            />
        ELSE:
            <View>
                <ProgressHeader
                    current={quiz.currentIndex + 1}
                    total={quiz.queue.length}
                    onClose={router.back}
                />
                <ProgressBar value={progress} />

                <QuizQuestion
                    question={currentQuestion}
                    mode={currentQuestion.mode}
                />

                <TextInput
                    value={quiz.userAnswer}
                    onChange={v => quiz.userAnswer = v}
                />

                IF quiz.isAnswered:
                    <FeedbackCard correct={quiz.isCorrect} />
                    <Button onClick={nextQuestion}>Next</Button>
                ELSE:
                    <Button onClick={checkAnswer}>Check</Button>
                    <Button onClick={skipQuestion}>Skip</Button>
            </View>
```

### `app/flash-cards.tsx` - Flashcard Ekranı

```pseudo
SCREEN FlashcardsScreen:
    words = useVocabStore(state => state.words)
    recordReview = useVocabStore(state => state.recordReview)

    STATE currentIndex = 0

    // Animasyon değerleri
    translateX = useSharedValue(0)
    rotate = useSharedValue(0)

    // Due kelimeler önce
    sortedWords = useMemo(() => {
        dueWords = getDueWords(words)
        sortedDue = sortByReviewPriority(dueWords)
        nonDue = words.FILTER(w => NOT dueWords.includes(w))
        RETURN [...sortedDue, ...nonDue]
    })

    currentCard = sortedWords[currentIndex % sortedWords.length]
    nextCard = sortedWords[(currentIndex + 1) % sortedWords.length]

    FUNCTION handleSwipe(isLearned):
        // SRS güncelle
        quality = mapResultToQuality(isLearned)  // true=4, false=2
        recordReview(currentCard.id, quality)

        // Sonraki karta geç
        currentIndex++
        translateX.value = 0
        rotate.value = 0

    gesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX
            rotate.value = (event.translationX / SCREEN_WIDTH) * 20

            IF ABS(event.translationX) > SWIPE_THRESHOLD:
                Haptics.impact()
        })
        .onEnd((event) => {
            IF ABS(event.translationX) > SWIPE_THRESHOLD:
                direction = event.translationX > 0 ? 1 : -1
                isLearned = direction > 0  // Sağ = öğrendim

                translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5)
                runOnJS(handleSwipe)(isLearned)
            ELSE:
                translateX.value = withSpring(0)
                rotate.value = withSpring(0)
        })

    RENDER:
        <View>
            <ProgressHeader
                current={currentIndex + 1}
                total={sortedWords.length}
                onClose={router.back}
            />
            <ProgressBar value={progress} />

            <SwipeIndicators>
                <LeftIndicator opacity={skipOpacity}>
                    <X /> Skip
                </LeftIndicator>
                <RightIndicator opacity={learnedOpacity}>
                    Learned <Check />
                </RightIndicator>
            </SwipeIndicators>

            <CardStack>
                // Arka plan kartları
                <StackedCard card={nextNextCard} depth={2} />
                <StackedCard card={nextCard} depth={1} />

                // Aktif kart (sürüklenebilir)
                <GestureDetector gesture={gesture}>
                    <AnimatedView style={topCardStyle}>
                        <WordCard card={currentCard} />
                    </AnimatedView>
                </GestureDetector>
            </CardStack>
        </View>
```

### `app/(tabs)/bridge.tsx` - B1 Bridge Ekranı

```pseudo
SCREEN BridgeScreen:
    STATE inputPhrase = ""

    transformMutation = useMutation({
        mutationFn: (phrase) => geminiService.transformToB1(phrase)
    })

    FUNCTION handleTransform():
        IF inputPhrase.trim().length > 0:
            transformMutation.mutate(inputPhrase)

    RENDER:
        <ScrollView>
            <Header>
                <Title>B1 Bridge 🌉</Title>
                <Subtitle>Transform simple phrases to B1 level</Subtitle>
            </Header>

            <TextInput
                value={inputPhrase}
                onChange={v => inputPhrase = v}
                placeholder="Type a simple phrase..."
            />

            <Button
                onClick={handleTransform}
                loading={transformMutation.isPending}
            >
                Transform to B1
            </Button>

            <ExampleSuggestions
                examples={["I want coffee", "Where is hotel?", ...]}
                onSelect={phrase => inputPhrase = phrase}
            />

            IF transformMutation.isSuccess:
                <ResultCard>
                    <Section label="Your phrase (A2)">
                        {transformMutation.data.original}
                    </Section>
                    <Arrow />
                    <Section label="B1 Version">
                        {transformMutation.data.b1Version}
                    </Section>
                    <Section label="Why it's better">
                        {transformMutation.data.explanation}
                    </Section>
                </ResultCard>
        </ScrollView>
```

---

## 🔄 Hooks (Custom Hooks)

### `hooks/use-add-word.ts`

```pseudo
HOOK useAddWord(options):
    addWord = useVocabStore(state => state.addWord)

    RETURN useMutation({
        mutationFn: ASYNC (word) => {
            content = AWAIT geminiService.generateWordCard(word)

            newCard = {
                id: generateUUID(),
                word: word,
                content: content,
                createdAt: NOW(),
                lastContextUpdate: NOW(),
                masteryLevel: 0,
                srs: getInitialSRSState()
            }

            RETURN newCard
        },

        onSuccess: (card) => {
            addWord(card)
            Haptics.notificationSuccess()
            options?.onSuccess?.(card)
        },

        onError: (error) => {
            Haptics.notificationError()
            options?.onError?.(error)
        }
    })
```

### `hooks/use-context-refresh.ts`

```pseudo
HOOK useContextRefresh(cardId):
    updateWord = useVocabStore(state => state.updateWord)
    getWord = useVocabStore(state => state.getWord)

    RETURN useMutation({
        mutationFn: ASYNC () => {
            card = getWord(cardId)
            newContent = AWAIT geminiService.refreshContext(
                card.word,
                card.content.meaningTr
            )
            RETURN newContent
        },

        onSuccess: (newContent) => {
            updateWord(cardId, {
                content: {...currentContent, ...newContent},
                lastContextUpdate: NOW()
            })
        }
    })
```

---

## 📊 Veri Akışı Özeti

```
┌─────────────────────────────────────────────────────────────┐
│                    KULLANICI AKSİYONU                        │
│    (Kelime ekle, Quiz cevapla, Flashcard kaydır, vb.)       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      COMPONENT                               │
│              (Event handler çağrılır)                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────┐           ┌───────────────────┐
│   GEMINI SERVICE  │           │    SRS SERVICE    │
│   (AI içerik)     │           │   (Aralık hesap)  │
└─────────┬─────────┘           └─────────┬─────────┘
          │                               │
          └───────────────┬───────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     ZUSTAND STORE                            │
│              (State güncellenir)                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        MMKV                                  │
│              (Persist middleware ile kaydet)                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    UI YENİDEN RENDER                         │
│        (useVocabStore hook'u ile otomatik güncelleme)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 SRS Algoritması Akışı

```
┌─────────────────────────────────────────────────────────────┐
│                    YENİ KELİME EKLENDİ                       │
│            srs = { EF: 2.5, interval: 0, reps: 0 }          │
│                  nextReviewDate = NOW()                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       ANA SAYFA                              │
│          ReviewStats: "1 Due Now" gösterir                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               QUIZ / FLASHCARD BAŞLAT                        │
│        getDueWords() → Due kelimeler öne sıralanır           │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
┌───────────────────┐               ┌───────────────────┐
│   DOĞRU CEVAP     │               │   YANLIŞ CEVAP    │
│   quality = 5     │               │   quality = 2     │
└─────────┬─────────┘               └─────────┬─────────┘
          │                                   │
          ▼                                   ▼
┌───────────────────┐               ┌───────────────────┐
│ calculateNext...  │               │ calculateNext...  │
│ reps = 1          │               │ reps = 0          │
│ interval = 1 gün  │               │ interval = 1 gün  │
│ EF = 2.6          │               │ EF = 1.7          │
└─────────┬─────────┘               └─────────┬─────────┘
          │                                   │
          └───────────────┬───────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    STORE GÜNCELLENİR                         │
│           recordReview(id, quality) çağrılır                 │
│            masteryLevel = MIN(5, reps / 2)                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   SONRAKI TEKRAR                             │
│    ReviewStats: "Next Review: 1 day" veya "Due Now"         │
└─────────────────────────────────────────────────────────────┘
```

window.addEventListener('DOMContentLoaded', function () {
  const birthday = new Date('2008-10-01T00:00:00');
  const ageValue = document.getElementById('ageValue');
  const audio = document.getElementById('birthdayAudio');
  const musicToggle = document.getElementById('musicToggle');
  const musicIcon = document.getElementById('musicIcon');
  const giftBox = document.getElementById('giftBox');
  const giftLabel = document.getElementById('giftLabel');
  const introOverlay = document.getElementById('introOverlay');
  const startCelebration = document.getElementById('startCelebration');
  const giftOverlay = document.getElementById('giftOverlay');
  const celebrationCard = document.getElementById('celebrationCard');
  const replayGift = document.getElementById('replayGift');
  const giftLockMessage = document.getElementById('giftLockMessage');
  const giftNote = document.getElementById('giftNote');
  const giftPassword = document.getElementById('giftPassword');
  const unlockGift = document.getElementById('unlockGift');
  const passwordError = document.getElementById('passwordError');
  const lockPanel = document.getElementById('lockPanel');
  const correctPassword = '0110';
  const miniGame = document.getElementById('miniGame');
  const gamePrompt = document.getElementById('gamePrompt');
  const gameStatus = document.getElementById('gameStatus');
  const typewriterBox = document.getElementById('typewriterBox');
  const typewriterText = document.getElementById('typewriterText');
  const memoryGrid = document.getElementById('memoryGrid');
  let isMusicOn = false;
  let typewriterTimer = null;
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matchedPairs = 0;

  function calculateAge() {
    const now = new Date();
    let age = now.getFullYear() - birthday.getFullYear();
    const hasBirthdayPassedThisYear =
      now.getMonth() > birthday.getMonth() ||
      (now.getMonth() === birthday.getMonth() && now.getDate() >= birthday.getDate());

    if (!hasBirthdayPassedThisYear) {
      age--;
    }

    if (ageValue) {
      ageValue.textContent = String(Math.max(age, 0));
    }
  }

  function setMusicState(isPlaying) {
    if (!musicIcon || !musicToggle) return;
    musicIcon.textContent = isPlaying ? '♫' : '🔇';
    musicToggle.setAttribute('aria-label', isPlaying ? 'كتم الموسيقى' : 'تشغيل الموسيقى');
    musicToggle.title = isPlaying ? 'كتم الموسيقى' : 'تشغيل الموسيقى';
  }

  async function startMusic() {
    if (!audio) return false;

    try {
      audio.volume = 0.35;
      await audio.play();
      isMusicOn = true;
      setMusicState(true);
      return true;
    } catch (error) {
      isMusicOn = false;
      setMusicState(false);
      return false;
    }
  }

  function stopMusic() {
    if (!audio) return;
    audio.pause();
    isMusicOn = false;
    setMusicState(false);
  }

  async function toggleMusic() {
    if (!audio) return;

    if (isMusicOn && !audio.paused) {
      stopMusic();
      return;
    }

    await startMusic();
  }

  function updateGiftState() {
    const unlocked = giftBox && giftBox.dataset.unlocked === 'true';

    if (giftBox) {
      giftBox.disabled = !unlocked;
      giftBox.setAttribute('aria-label', unlocked ? 'فتح الهدية' : 'أدخل كلمة السر');
    }

    if (giftLabel) {
      giftLabel.textContent = unlocked ? 'افتحي الهدية' : 'سووووون';
    }

    if (giftLockMessage) {
      giftLockMessage.textContent = unlocked ? 'الهدية جاهزة الآن!' : 'هممم🤔ايش الكلمة يا ترى';
      giftLockMessage.classList.toggle('is-ready', unlocked);
    }

    if (lockPanel) {
      lockPanel.style.display = unlocked ? 'none' : 'grid';
    }

    if (giftNote) {
      giftNote.classList.toggle('hidden', !unlocked);
      giftNote.style.opacity = unlocked ? '1' : '0';
    }
  }

  function unlockGiftWithPassword() {
    const entered = (giftPassword && giftPassword.value ? giftPassword.value.trim() : '').toString();

    if (entered !== correctPassword) {
      if (passwordError) {
        passwordError.textContent = 'كلمة المرور غير صحيحة';
      }
      return;
    }

    if (giftBox) {
      giftBox.dataset.unlocked = 'true';
    }

    if (passwordError) {
      passwordError.textContent = '';
    }

    if (giftPassword) {
      giftPassword.value = '';
    }

    updateGiftState();
    openGift();
  }

  function openGift() {
    if (!giftOverlay || !celebrationCard) return;
    if (giftBox && giftBox.dataset.unlocked !== 'true') return;
    document.body.classList.add('celebrating');
    giftOverlay.classList.add('hidden');
    celebrationCard.classList.remove('hidden');
    celebrationCard.classList.add('visible');
  }

  function shuffleCards() {
    const cards = Array.from(memoryGrid ? memoryGrid.querySelectorAll('.memory-card') : []);

    const symbols = ['🩵', '🫂', '🎂'];
    const deck = [...symbols, ...symbols].sort(function () {
      return Math.random() - 0.5;
    });

    cards.forEach(function (card, index) {
      card.dataset.value = deck[index];
      card.textContent = '?';
      card.classList.remove('matched', 'revealed');
      card.disabled = false;
      card.setAttribute('aria-label', 'بطاقة');
    });

    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matchedPairs = 0;
  }

  function resetMiniGame() {
    if (gameStatus) {
      gameStatus.textContent = '';
      gameStatus.classList.remove('wrong');
    }

    if (typewriterBox) {
      typewriterBox.classList.add('hidden');
    }

    if (typewriterText) {
      typewriterText.textContent = '';
    }

    if (gamePrompt) {
      gamePrompt.textContent = 'اكتشف الأزواج المتطابقة 💞';
    }

    if (typewriterTimer) {
      clearInterval(typewriterTimer);
      typewriterTimer = null;
    }

    shuffleCards();
  }

  function typeMessage(message) {
    if (!typewriterText || !typewriterBox) return;

    typewriterText.textContent = '';
    typewriterBox.classList.remove('hidden');

    let index = 0;
    if (typewriterTimer) clearInterval(typewriterTimer);

    typewriterTimer = setInterval(function () {
      typewriterText.textContent += message[index] || '';
      index += 1;

      if (index >= message.length) {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
      }
    }, 28);
  }

  function checkWin() {
    if (matchedPairs !== 3) return;

    if (gameStatus) {
      gameStatus.textContent = 'كفوووو عليكييي👏';
    }

    const message = 'في هذا اليوم حيث تُضاء السماء بأجمل الألوان، أنتِ يا من أضأتِ حياتنا بحضوركِ وملأتِ أيامنا بالفرح والسرور. كُلّ عامٍ وأنتِ بألف خيرٍ وفي سعادةٍ لا تفنى ولا تنتهي، يوم ميلادكِ هو يومٌ خاص يحمل معه أجمل الأماني، ويحمل معه من عبق الورود أجملها. وكل لحظةٍ فيه هي هديةٌ من السماء لعالمنا. فأنتِ من أجمل الهدايا التي أهدتها لنا الحياة. عيد ميلاد سعيد يا من تملئين القلوب بهجة، أتمنى لكِ عاماً مليئاً بالفرح والسعادة والطمأنينة، وأن تكون أيامكِ القادمة مليئةً باللحظات الجميلة والذكريات التي تستحق أن تبقى في القلب. وأن تحققي كل ما تسعين إليه وتحلمين به، وأن يفتح الله لكِ أبواب الخير من حيث لا تحتسبين. أنتِ الأمل والروح الجميلة، وأنتِ السعادة التي تترك أثراً طيباً أينما حلّت. فكل عام وأنتِ بخير، ورزقكِ الله الصحة والسلامة في كل عامٍ وشهرٍ وأسبوعٍ ويومٍ وساعةٍ ودقيقةٍ وثانية. يا زوزة، يا أجمل من عرفتُ من الأرواح الطيبة. . . . زهراء... اسمٌ إذا ذُكر، تبعته البسمة دون استئذان. واسمكِ يا زهراء يحمل معنى الإشراق والجمال، ويشبه روحكِ الطيبة التي تنشر الفرح والبهجة، ويترك في القلب أثراً جميلاً. واسمكِ ليس مجرد اسمٍ جميل، بل هو اسمٌ يشبه صاحبتَه، جميلٌ في معناه، وقريبٌ من القلب. حبيبةٌ وصديقةٌ عزيزةٌ أنتِ، لكِ في القلب مكانٌ لا يشبهه مكان. وسعيدٌ أنني عرفتكِ في يومٍ من تلك الأيام، فكان يومَ معرفةٍ جميلة، ويومًا أضاف إلى الذاكرة ذكرى لا تُنسى. شكراً لأنكِ كنتِ دائماً من الأشخاص الذين يجعلون الأيام أخف، والضحكات أصدق، واللحظات أجمل. وأتمنى أن تبقى روحكِ كما هي، نقيةً، طيبةً، ومليئةً بذلك الفرح الذي اعتدناه منكِ. كل عام وأنتِ زهراء الحلوة، وكل عام وأنتِ بخير وسلام وطمأنينة، وكل عام وأنتِ محاطةٌ بمن يحبكِ ويقدّركِ ويخاف على قلبكِ من كل حزن. أسأل الله أن يحفظكِ لي ولأهلكِ وأحبابكِ، وأن يكتب لكِ في عامكِ الجديد من الخير والفرح أضعاف ما تتمنين. عيد ميلاد سعيد يا زهراء 🤍🦋، واستودعكِ الرحمن، وحفظكِ الله أينما كنتِ.';
    typeMessage(message);
  }

  function handleMemoryCardClick(event) {
    const card = event.currentTarget;

    if (!card || lockBoard || card.disabled || card.classList.contains('matched')) return;

    card.textContent = card.dataset.value;
    card.classList.add('revealed');

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    lockBoard = true;

    const isMatch = firstCard.dataset.value === secondCard.dataset.value;

    if (isMatch) {
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');
      firstCard.disabled = true;
      secondCard.disabled = true;
      matchedPairs += 1;
      checkWin();
      firstCard = null;
      secondCard = null;
      lockBoard = false;
      return;
    }

    if (gameStatus) {
      gameStatus.textContent = 'مش هاد جربي مرة تانية😜';
      gameStatus.classList.add('wrong');
    }

    setTimeout(function () {
      firstCard.textContent = '?';
      secondCard.textContent = '?';
      firstCard.classList.remove('revealed');
      secondCard.classList.remove('revealed');
      firstCard = null;
      secondCard = null;
      lockBoard = false;
      if (gameStatus) {
        gameStatus.textContent = '';
        gameStatus.classList.remove('wrong');
      }
    }, 700);
  }

  function hideIntroScreen() {
    if (!introOverlay) return;
    introOverlay.classList.add('hidden');
    introOverlay.setAttribute('aria-hidden', 'true');
  }

  function resetGift() {
    if (!giftOverlay || !celebrationCard) return;
    document.body.classList.remove('celebrating');
    celebrationCard.classList.remove('visible');
    celebrationCard.classList.add('hidden');
    giftOverlay.classList.remove('hidden');
    resetMiniGame();
  }

  if (giftBox) {
    giftBox.dataset.unlocked = 'false';
    giftBox.addEventListener('click', openGift);
  }

  if (memoryGrid) {
    const cards = memoryGrid.querySelectorAll('.memory-card');
    cards.forEach(function (card) {
      card.addEventListener('click', handleMemoryCardClick);
    });
  }

  if (unlockGift) {
    unlockGift.addEventListener('click', unlockGiftWithPassword);
  }

  if (giftPassword) {
    giftPassword.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        unlockGiftWithPassword();
      }
    });
  }

  if (replayGift) {
    replayGift.addEventListener('click', function () {
      resetGift();
      setTimeout(function () {
        if (giftBox) giftBox.focus();
      }, 200);
    });
  }

  if (startCelebration) {
    startCelebration.addEventListener('click', function () {
      hideIntroScreen();
    });
  }

  if (introOverlay) {
    setTimeout(function () {
      hideIntroScreen();
    }, 2600);
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', function (event) {
      event.preventDefault();
      toggleMusic();
    });
  }

  document.addEventListener('pointerdown', function () {
    if (!audio || audio.dataset.started === 'true') return;
    audio.dataset.started = 'true';
    startMusic();
  }, { once: true });

  calculateAge();
  updateGiftState();
  setMusicState(false);
  resetGift();
});

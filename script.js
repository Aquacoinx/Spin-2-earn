class MultiRewardSpinGame {
    constructor() {
        this.spinsLeft = 3;
        this.totalRewards = {
            AQCNX: 0,
            TON: 0,
            vouchers: 0
        };
        this.isSpinning = false;
        this.currentRotation = 0;
        this.rewardsHistory = [];

        // Define 6 segments with their exact angles (60 degrees each)
        this.segments = [
            { value: 20, currency: "AQCNX", type: "Common", angle: 60, startAngle: 330, endAngle: 30 },      // Top segment
            { value: 0.5, currency: "TON", type: "Rare", angle: 120, startAngle: 30, endAngle: 90 },           // Top-right
            { value: 100, currency: "$", type: "Voucher", angle: 180, startAngle: 90, endAngle: 150 },      // Bottom-right
            { value: 30, currency: "AQCNX", type: "Common", angle: 240, startAngle: 150, endAngle: 210 },   // Bottom
            { value: 50, currency: "AQCNX", type: "Uncommon", angle: 300, startAngle: 210, endAngle: 270 }, // Bottom-left
            { value: 0.3, currency: "TON", type: "Epic", angle: 360, startAngle: 270, endAngle: 330 }        // Top-left
        ];

        this.init();
    }

    init() {
        this.updateDisplay();
        this.setupEventListeners();
        console.log('MultiRewardSpinGame initialized');
    }

    setupEventListeners() {
        const spinButton = document.getElementById('spinBtn');
        const wheelCenterButton = document.getElementById('spinButton');

        if (spinButton) {
            spinButton.addEventListener('click', () => this.spin());
        }
        if (wheelCenterButton) {
            wheelCenterButton.addEventListener('click', () => this.spin());
        }
    }

    updateDisplay() {
        document.getElementById('spinsLeft').textContent = this.spinsLeft;
        document.getElementById('totalAQCNX').textContent = this.totalRewards.AQCNX;
        document.getElementById('totalTON').textContent = this.totalRewards.TON;
        document.getElementById('totalVouchers').textContent = this.totalRewards.vouchers;

        // Update button states
        const spinButtons = [document.getElementById('spinBtn'), document.getElementById('spinButton')];
        spinButtons.forEach(btn => {
            if (btn) {
                btn.disabled = this.spinsLeft <= 0 || this.isSpinning;
                if (this.spinsLeft <= 0) {
                    btn.textContent = 'No Spins Left';
                } else if (this.isSpinning) {
                    btn.textContent = 'SPINNING...';
                } else {
                    btn.innerHTML = '<span>SPIN NOW</span>';
                }
            }
        });
    }

    spin() {
        if (this.spinsLeft <= 0 || this.isSpinning) {
            console.log('Cannot spin: spinsLeft =', this.spinsLeft, 'isSpinning =', this.isSpinning);
            return;
        }

        console.log('Starting spin...');
        this.isSpinning = true;
        this.spinsLeft--;
        this.updateDisplay();
        this.hidePrizeDisplay();

        // Randomly select a segment
        const selectedSegment = this.segments[Math.floor(Math.random() * this.segments.length)];
        console.log('Selected segment:', selectedSegment);

        this.spinWheel(selectedSegment);
    }

    spinWheel(targetSegment) {
        const wheel = document.getElementById('wheel');
        if (!wheel) return;

        // Calculate spins and final position
        const minSpins = 20;
        const maxSpins = 50;
        const spins = minSpins + Math.random() * (maxSpins - minSpins);
        const totalRotation = spins * 360;

        // Calculate the target angle to land on the selected segment
        // The pointer is at the top (0 degrees), so we need to rotate the wheel
        // so that the center of the target segment aligns with the pointer
        const targetAngle = targetSegment.angle;

        // Calculate final rotation: current rotation + full spins + adjustment to land on target
        // We subtract the target angle because we want that segment to end up at the top (0 degrees)
        const finalRotation = this.currentRotation + totalRotation + (360 - targetAngle);

        console.log('Target segment angle:', targetAngle);
        console.log('Final rotation:', finalRotation);
        console.log('Current rotation:', this.currentRotation);

        // Apply rotation with smooth animation
        wheel.style.transition = 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)';
        wheel.style.transform = `rotate(${finalRotation}deg)`;

        // Update current rotation for next spin
        this.currentRotation = finalRotation % 360;

        // End spinning after animation
        setTimeout(() => {
            this.endSpin(targetSegment);
        }, 4000);
    }

    endSpin(selectedSegment) {
        console.log('Spin ended. Reward:', selectedSegment);
        this.isSpinning = false;

        // Add rewards
        if (selectedSegment.currency === 'AQCNX') {
            this.totalRewards.AQCNX += selectedSegment.value;
        } else if (selectedSegment.currency === 'TON') {
            this.totalRewards.TON += selectedSegment.value;
        } else if (selectedSegment.currency === '$') {
            this.totalRewards.vouchers += selectedSegment.value;
        }

        // Add to history
        this.rewardsHistory.unshift(selectedSegment);
        if (this.rewardsHistory.length > 10) {
            this.rewardsHistory.pop();
        }

        this.updateDisplay();
        this.updateRewardsHistory();
        this.showPrizeDisplay(selectedSegment);
    }

    showPrizeDisplay(segment) {
        const prizeDisplay = document.getElementById('prizeDisplay');
        const prizeIcon = document.getElementById('prizeIcon');
        const prizeAmount = document.getElementById('prizeAmount');
        const prizeType = document.getElementById('prizeType');
        const voucherNote = document.getElementById('voucherNote');

        if (!prizeDisplay) return;

        // Set appropriate icon and text
        let icon = '🎉';
        let amountText = '';

        if (segment.currency === 'AQCNX') {
            icon = '🪙';
            amountText = `${segment.value} AQCNX`;
        } else if (segment.currency === 'TON') {
            icon = '💎';
            amountText = `${segment.value} TON`;
        } else if (segment.currency === '$') {
            icon = '🎫';
            amountText = `$${segment.value} Voucher`;
        }

        prizeIcon.textContent = icon;
        prizeAmount.textContent = amountText;
        prizeType.textContent = `${segment.type} Reward`;

        // Show voucher note for voucher rewards
        if (segment.currency === '$') {
            voucherNote.style.display = 'block';
        } else {
            voucherNote.style.display = 'none';
        }

        prizeDisplay.classList.add('show');

        setTimeout(() => {
            this.hidePrizeDisplay();
        }, 4000);
    }

    hidePrizeDisplay() {
        const prizeDisplay = document.getElementById('prizeDisplay');
        if (prizeDisplay) {
            prizeDisplay.classList.remove('show');
        }
    }

    updateRewardsHistory() {
        const historyContainer = document.getElementById('rewardsHistory');
        if (!historyContainer) return;

        if (this.rewardsHistory.length === 0) {
            historyContainer.innerHTML = '<div style="text-align: center; color: #bfdbfe; padding: 2rem;">No rewards yet. Start spinning!</div>';
            return;
        }

        const historyHTML = this.rewardsHistory.map(reward => {
            let icon = '🪙';
            let text = '';

            if (reward.currency === 'AQCNX') {
                icon = '🪙';
                text = `${reward.value} AQCNX`;
            } else if (reward.currency === 'TON') {
                icon = '💎';
                text = `${reward.value} TON`;
            } else if (reward.currency === '$') {
                icon = '🎫';
                text = `$${reward.value} Voucher`;
            }

            return `
                <div class="history-item">
                    <span class="history-icon">${icon}</span>
                    <span class="history-text">${text}</span>
                    <span class="history-type">${reward.type}</span>
                </div>
            `;
        }).join('');

        historyContainer.innerHTML = historyHTML;
    }

    buySpins(amount) {
        console.log(`Buying ${amount} spins`);
        this.spinsLeft += amount;
        this.updateDisplay();

        // Show purchase confirmation
        const prizeDisplay = document.getElementById('prizeDisplay');
        const prizeIcon = document.getElementById('prizeIcon');
        const prizeAmount = document.getElementById('prizeAmount');
        const prizeType = document.getElementById('prizeType');

        if (prizeDisplay) {
            prizeIcon.textContent = '🎫';
            prizeAmount.textContent = `+${amount} Spins`;
            prizeType.textContent = 'Purchase Complete';
            prizeDisplay.classList.add('show');

            setTimeout(() => {
                this.hidePrizeDisplay();
            }, 2000);
        }
    }
}

// Initialize the game
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new MultiRewardSpinGame();
    console.log('Game instance created and attached to window');
});

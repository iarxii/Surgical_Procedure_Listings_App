<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Procedure extends Model
{
    protected $fillable = [
        'speciality', 'procedure_name', 'level', 'care_icu',
        'ttg_months', 'ttg_days', 'ttg_minimum_70_pct', 'ttg_alert_90_pct',
        'icd10_verified_at', 'icd11_verified_at', 'mapping_verified_at',
    ];

    protected $casts = [
        'icd10_verified_at'   => 'datetime',
        'icd11_verified_at'   => 'datetime',
        'mapping_verified_at' => 'datetime',
    ];

    public function icdCodes()
    {
        return $this->belongsToMany(IcdCode::class, 'procedure_icd_mappings')
            ->withPivot('mapping_type')
            ->withTimestamps();
    }
}
